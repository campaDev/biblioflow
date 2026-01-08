import { defineMiddleware } from "astro:middleware";

export const onRequest = defineMiddleware(async (context, next) => {
  const { url, cookies, redirect } = context;

  // 1. Definir rutas protegidas (todo lo que empiece por /admin)
  if (url.pathname.startsWith("/admin")) {
    // 2. Excluir la página de login para evitar bucles infinitos
    if (url.pathname === "/admin/login") {
      // Si ya tiene token y va al login, lo mandamos directo al dashboard
      if (cookies.get("sb-access-token")) {
        return redirect("/admin/dashboard");
      }
      return next();
    }

    // 3. Verificar si existe la cookie de acceso
    const accessToken = cookies.get("sb-access-token");

    // 4. Si no hay token, fuera de aquí -> al login
    if (!accessToken) {
      return redirect("/admin/login");
    }
  }

  return next();
});
