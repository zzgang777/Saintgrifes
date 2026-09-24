"use client"

import { useState, type FormEvent } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createSupabaseBrowserClient } from "@/lib/supabase/client"

const inputClass =
  "w-full rounded-sm border border-border bg-secondary px-3.5 py-2.5 text-foreground outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-signal"

export function SignupForm() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [checkEmail, setCheckEmail] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    if (password.length < 6) {
      setError("A senha precisa ter pelo menos 6 caracteres.")
      setLoading(false)
      return
    }

    const supabase = createSupabaseBrowserClient()
    if (!supabase) {
      setError("Cadastro indisponível no momento. Tente de novo mais tarde.")
      setLoading(false)
      return
    }

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
        emailRedirectTo: `${window.location.origin}/conta`,
      },
    })

    if (signUpError) {
      setError(
        signUpError.message === "User already registered" ? "Já existe uma conta com esse e-mail." : "Não foi possível criar a conta. Tente de novo.",
      )
      setLoading(false)
      return
    }

    // Sem confirmação de e-mail configurada no projeto, o Supabase já devolve a conta logada.
    if (data.session) {
      router.push("/conta")
      router.refresh()
      return
    }

    setCheckEmail(true)
    setLoading(false)
  }

  if (checkEmail) {
    return (
      <div className="flex w-full max-w-sm flex-col gap-3 text-center">
        <p className="font-medium text-foreground">Quase lá!</p>
        <p className="text-sm text-muted-foreground">
          Enviamos um link de confirmação para <span className="text-foreground">{email}</span>. Abra o e-mail e clique no link
          pra ativar sua conta.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full max-w-sm flex-col gap-4">
      <label className="flex flex-col gap-1.5">
        <span className="text-sm text-muted-foreground">Nome completo</span>
        <input required value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
      </label>
      <label className="flex flex-col gap-1.5">
        <span className="text-sm text-muted-foreground">E-mail</span>
        <input
          required
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={inputClass}
        />
      </label>
      <label className="flex flex-col gap-1.5">
        <span className="text-sm text-muted-foreground">Senha</span>
        <input
          required
          type="password"
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={inputClass}
        />
        <span className="text-xs text-muted-foreground/70">Pelo menos 6 caracteres.</span>
      </label>

      {error && <p className="text-sm text-signal">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="mt-2 flex w-full items-center justify-center rounded-sm bg-primary py-3 font-semibold uppercase tracking-wide text-primary-foreground transition-colors hover:bg-accent disabled:opacity-60"
      >
        {loading ? "Criando conta..." : "Criar conta"}
      </button>

      <p className="text-center text-sm text-muted-foreground">
        Já tem conta?{" "}
        <Link href="/conta/entrar" className="font-medium text-foreground underline underline-offset-4 hover:text-signal">
          Entrar
        </Link>
      </p>
    </form>
  )
}
