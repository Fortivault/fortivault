import { NextResponse } from "next/server"

export function ok(data?: any) {
  return NextResponse.json(data || { success: true }, { status: 200 })
}

export function created(data?: any) {
  return NextResponse.json(data || { success: true }, { status: 201 })
}

export function badRequest(message: string = "Bad Request") {
  return NextResponse.json({ error: message }, { status: 400 })
}

export function unauthorized(message: string = "Unauthorized") {
  return NextResponse.json({ error: message }, { status: 401 })
}

export function forbidden(message: string = "Forbidden") {
  return NextResponse.json({ error: message }, { status: 403 })
}

export function notFound(message: string = "Not Found") {
  return NextResponse.json({ error: message }, { status: 404 })
}

export function methodNotAllowed(message: string = "Method Not Allowed") {
  return NextResponse.json({ error: message }, { status: 405 })
}

export function conflict(message: string = "Conflict") {
  return NextResponse.json({ error: message }, { status: 409 })
}

export function tooManyRequests(message: string = "Too Many Requests") {
  return NextResponse.json({ error: message }, { status: 429 })
}

export function serverError(message: string = "Internal Server Error") {
  return NextResponse.json({ error: message }, { status: 500 })
}

export function notImplemented(message: string = "Not Implemented") {
  return NextResponse.json({ error: message }, { status: 501 })
}