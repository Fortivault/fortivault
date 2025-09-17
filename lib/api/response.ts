export function ok(data?: any) {
  return new Response(JSON.stringify(data || { success: true }), {
    status: 200,
    headers: { "content-type": "application/json" },
  })
}

export function created(data?: any) {
  return new Response(JSON.stringify(data || { success: true }), {
    status: 201,
    headers: { "content-type": "application/json" },
  })
}

export function badRequest(message: string = "Bad Request") {
  return new Response(JSON.stringify({ error: message }), {
    status: 400,
    headers: { "content-type": "application/json" },
  })
}

export function unauthorized(message: string = "Unauthorized") {
  return new Response(JSON.stringify({ error: message }), {
    status: 401,
    headers: { "content-type": "application/json" },
  })
}

export function forbidden(message: string = "Forbidden") {
  return new Response(JSON.stringify({ error: message }), {
    status: 403,
    headers: { "content-type": "application/json" },
  })
}

export function notFound(message: string = "Not Found") {
  return new Response(JSON.stringify({ error: message }), {
    status: 404,
    headers: { "content-type": "application/json" },
  })
}

export function methodNotAllowed(message: string = "Method Not Allowed") {
  return new Response(JSON.stringify({ error: message }), {
    status: 405,
    headers: { "content-type": "application/json" },
  })
}

export function conflict(message: string = "Conflict") {
  return new Response(JSON.stringify({ error: message }), {
    status: 409,
    headers: { "content-type": "application/json" },
  })
}

export function tooManyRequests(message: string = "Too Many Requests") {
  return new Response(JSON.stringify({ error: message }), {
    status: 429,
    headers: { "content-type": "application/json" },
  })
}

export function serverError(message: string = "Internal Server Error") {
  return new Response(JSON.stringify({ error: message }), {
    status: 500,
    headers: { "content-type": "application/json" },
  })
}

export function notImplemented(message: string = "Not Implemented") {
  return new Response(JSON.stringify({ error: message }), {
    status: 501,
    headers: { "content-type": "application/json" },
  })
}
