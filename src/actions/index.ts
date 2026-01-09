import { defineAction } from "astro:actions";
import { z } from "astro:schema";
import { supabase } from "@lib/supabase";

// Función auxiliar para verificar si el usuario es Admin
async function requireAdmin(context: any) {
  const accessToken = context.cookies.get("sb-access-token")?.value;
  const refreshToken = context.cookies.get("sb-refresh-token")?.value;

  if (!accessToken || !refreshToken) {
    throw new Error("No hay sesión activa. Por favor inicia sesión.");
  }

  // 1. Establecer sesión
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.setSession({
    access_token: accessToken,
    refresh_token: refreshToken,
  });

  if (sessionError || !session) {
    throw new Error("Sesión inválida o expirada.");
  }

  // [DEBUG] Imprimir el ID que estamos buscando
  console.log("🔍 [DEBUG] Buscando perfil para User ID:", session.user.id);

  // 2. Verificar Rol en la tabla 'profiles'
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", session.user.id)
    .single();

  // [DEBUG] Imprimir lo que encontramos en la base de datos
  console.log("🔍 [DEBUG] Resultado DB Profile:", profile);

  if (profileError || !profile || profile.role !== "admin") {
    console.error("❌ Acceso denegado. Rol encontrado:", profile?.role);
    throw new Error("Permiso denegado. Se requiere rol de Administrador.");
  }

  return session;
}

export const server = {
  // ACCIÓN 1: BÚSQUEDA INTELIGENTE (Pública)
  searchProducts: defineAction({
    accept: "json",
    input: z.object({
      query: z.string().min(2, "Escribe al menos 2 letras"),
    }),
    handler: async ({ query }) => {
      const { data, error } = await supabase
        .from("products")
        .select(
          `
          title, slug, price, cover_image, author, 
          categories (name, slug)
        `,
        )
        // .eq("status", "active") // Comentado si quieres que busque todo
        .textSearch("fts_vector", query, {
          config: "spanish",
          type: "websearch",
        })
        .limit(6);

      if (error) {
        console.error("❌ Error en búsqueda:", error);
        throw new Error("Error al conectar con el catálogo.");
      }
      return data;
    },
  }),

  // ACCIÓN 2: CREAR PEDIDO (Pública)
  createOrder: defineAction({
    accept: "json",
    input: z.object({
      customer: z.object({
        name: z.string().min(2),
        phone: z.string().min(6),
      }),
      items: z.array(
        z.object({
          id: z.number(),
          quantity: z.number().min(1),
          price: z.number(),
          title: z.string(),
        }),
      ),
      total: z.number(),
      is_gift: z.boolean().default(false),
    }),
    handler: async ({ customer, items, total, is_gift }) => {
      // 1. Validar Stock
      for (const item of items) {
        const { data: product } = await supabase
          .from("products")
          .select("stock_qty")
          .eq("id", item.id)
          .single();

        if (!product || product.stock_qty < item.quantity) {
          throw new Error(`Stock insuficiente para: ${item.title}`);
        }
      }

      // 2. Crear Pedido
      const { data: order, error } = await supabase
        .from("orders_leads")
        .insert({
          customer_name: customer.name,
          customer_contact: customer.phone,
          cart_snapshot: items,
          total_amount: Math.round(total),
          status: "pending_whatsapp",
          is_gift: is_gift,
        })
        .select()
        .single();

      if (error) {
        console.error("❌ Error creando pedido:", error);
        throw new Error("No se pudo registrar el pedido.");
      }
      return { orderId: order.id, isGift: is_gift };
    },
  }),

  // ACCIÓN 3: CREAR PRODUCTO (Privada - Requiere Auth Admin)
  createProduct: defineAction({
    accept: "json",
    input: z.object({
      title: z.string().min(3),
      author: z.string().min(2),
      price: z.number().min(0),
      promotional_price: z.number().min(0).optional(),
      stock_qty: z.number().min(0),
      cover_image: z.string().url(),
      category_id: z.number(),
      isbn: z.string().optional(),
      published_year: z.number().optional(),
      description: z.string().optional(),
      language: z.enum(["es", "en", "pt"]).default("es"),
      status: z
        .enum(["active", "draft", "preorder", "archived"])
        .default("active"),
    }),
    handler: async (product, context) => {
      // Verificar Admin
      await requireAdmin(context);

      // Generar Slug
      const baseSlug = product.title
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "")
        .replace(/[\s_-]+/g, "-")
        .replace(/^-+|-+$/g, "");
      const uniqueSlug = `${baseSlug}-${Date.now().toString().slice(-4)}`;

      const { data, error } = await supabase
        .from("products")
        .insert({ ...product, slug: uniqueSlug })
        .select()
        .single();

      if (error) {
        console.error("Error creando producto:", error);
        throw new Error("Error al crear. Verifica los datos.");
      }
      return data;
    },
  }),

  // ACCIÓN 4: ACTUALIZAR PRODUCTO (Privada - Requiere Auth Admin)
  updateProduct: defineAction({
    accept: "json",
    input: z.object({
      id: z.number(),
      updates: z.object({
        title: z.string().min(3).optional(),
        author: z.string().min(2).optional(),
        price: z.number().min(0).optional(),
        promotional_price: z.number().min(0).nullable().optional(),
        stock_qty: z.number().min(0).optional(),
        cover_image: z.string().url().optional(),
        category_id: z.number().optional(),
        isbn: z.string().optional(),
        description: z.string().optional(),
        language: z.enum(["es", "en", "pt"]).optional(),
        status: z.enum(["active", "draft", "preorder", "archived"]).optional(),
      }),
    }),
    handler: async ({ id, updates }, context) => {
      // Verificar Admin
      await requireAdmin(context);

      console.log("🔍 Admin verificado. Actualizando ID:", id);

      const { data, error } = await supabase
        .from("products")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        console.error("❌ Error DB Update:", error);
        throw new Error("No se pudo actualizar el libro.");
      }
      return data;
    },
  }),

  // ACCIÓN 5: ELIMINAR PRODUCTO (Privada - Requiere Auth Admin)
  deleteProduct: defineAction({
    accept: "json",
    input: z.object({
      id: z.number(),
    }),
    handler: async ({ id }, context) => {
      // Verificar Admin
      await requireAdmin(context);

      const { error } = await supabase.from("products").delete().eq("id", id);

      if (error) {
        throw new Error("No se pudo eliminar (posibles pedidos asociados).");
      }
      return { success: true, id };
    },
  }),
  // ACCIÓN 6: ACTUALIZAR ESTADO DEL PEDIDO

  updateOrderStatus: defineAction({
    accept: "json",
    input: z.object({
      id: z.string(), // Es UUID (string)
      status: z.enum([
        "pending_whatsapp",
        "confirmed",
        "pending_shipment",
        "ready_for_pickup",
        "cancelled",
        "completed",
      ]),
    }),
    handler: async ({ id, status }, context) => {
      // 1. Seguridad: Solo admins
      await requireAdmin(context);

      console.log(`🔍 [DEBUG] Cambiando pedido ${id} a estado: ${status}`);

      // 2. Actualizar en DB
      const { data, error } = await supabase
        .from("orders_leads")
        .update({ status })
        .eq("id", id)
        .select()
        .single();

      if (error) {
        console.error("❌ Error actualizando pedido:", error);
        throw new Error("No se pudo cambiar el estado.");
      }

      return data;
    },
  }),

  // ACCION 7: SOLICITUD DE RE-STOCK (AVÍSAME CUANDO VUELVA)
  requestRestock: defineAction({
    accept: "json",
    input: z.object({
      productId: z.number(),
      contact: z.string().min(5, "El contacto es muy corto"), // Email o Teléfono
    }),
    handler: async ({ productId, contact }) => {
      // 1. Guardar en la tabla 'restock_requests'
      const { error } = await supabase.from("restock_requests").insert({
        product_id: productId,
        customer_contact: contact,
      });

      if (error) {
        console.error("Error guardando lead:", error);
        throw new Error("No pudimos guardar tu solicitud. Intenta de nuevo.");
      }

      return {
        success: true,
        message: "¡Anotado! Te avisaremos si conseguimos otro ejemplar.",
      };
    },
  }),
};
