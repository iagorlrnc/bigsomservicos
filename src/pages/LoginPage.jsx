import { useState } from "react"
import { useAuth } from "../context/AuthContext"
import { supabase } from "../lib/supabaseClient"
import FormField from "../components/FormField"
import Input from "../components/Input"
import bigsomLogo from "../public/assets/bigsomlogo.png"

export default function LoginPage() {
  const { login, signUp } = useAuth()
  const [mode, setMode] = useState("login") // "login" | "register" | "pending"

  // Login fields
  const [email, setEmail] = useState("")
  const [pass, setPass] = useState("")

  // Registration fields
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [confirmPass, setConfirmPass] = useState("")

  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState("")

  const isSupabaseConfigured =
    import.meta.env.VITE_SUPABASE_URL &&
    import.meta.env.VITE_SUPABASE_URL.indexOf("your-project-id") === -1 &&
    import.meta.env.VITE_SUPABASE_ANON_KEY &&
    import.meta.env.VITE_SUPABASE_ANON_KEY.indexOf("your-anon-key") === -1

  const getOfflineUsers = () => {
    const stored = localStorage.getItem("offline_users")
    if (stored) return JSON.parse(stored)

    const defaultUsers = [
      {
        email: "admin@bigsom.com",
        password: "bigsom2024",
        name: "Administrador",
        role: "admin",
        approved: true,
      },
      {
        email: "colaborador@bigsom.com",
        password: "colaborador2024",
        name: "Colaborador Padrão",
        role: "colaborador",
        approved: true,
      },
    ]
    localStorage.setItem("offline_users", JSON.stringify(defaultUsers))
    return defaultUsers
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setErr("")

    if (isSupabaseConfigured) {
      try {
        await login(email, pass)
      } catch (err) {
        console.error("Erro ao autenticar via Supabase:", err)
        setErr(err.message || "Credenciais inválidas ou erro de conexão.")
      } finally {
        setLoading(false)
      }
    } else {
      // Offline fallback login
      const localUsers = getOfflineUsers()
      const found = localUsers.find(
        (u) =>
          u.email.toLowerCase() === email.toLowerCase() && u.password === pass,
      )
      if (found) {
        if (!found.approved) {
          setErr("Sua conta está pendente de aprovação pelo administrador.")
          setLoading(false)
          return
        }
        sessionStorage.setItem("offline_auth", "true")
        sessionStorage.setItem("offline_role", found.role)
        sessionStorage.setItem("offline_email", found.email)
        window.location.reload()
      } else {
        setErr("Credenciais inválidas.")
        setLoading(false)
      }
    }
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    setLoading(true)
    setErr("")

    if (!name || !email || !pass || !confirmPass) {
      setErr("Por favor, preencha todos os campos obrigatórios.")
      setLoading(false)
      return
    }

    if (pass !== confirmPass) {
      setErr("As senhas não coincidem.")
      setLoading(false)
      return
    }

    if (isSupabaseConfigured) {
      try {
        // 1. Criar usuário no Supabase Auth
        const signUpData = await signUp(email, pass)
        const user = signUpData?.user
        if (!user) throw new Error("Erro ao criar usuário.")

        // 2. Criar registro do colaborador
        const { error: profileError } = await supabase
          .from("collaborators")
          .insert([
            {
              user_id: user.id,
              email: email,
              name: name,
              phone: phone,
              user_role: "colaborador",
              approved: false,
            },
          ])

        if (profileError) throw profileError

        // Deslogar imediatamente já que o signUp pode logar o usuário automaticamente no client
        await supabase.auth.signOut()
        setMode("pending")
      } catch (err) {
        console.error("Erro no cadastro:", err)
        setErr(err.message || "Erro ao realizar cadastro.")
      } finally {
        setLoading(false)
      }
    } else {
      // Offline mock registration
      try {
        const localUsers = getOfflineUsers()
        if (
          localUsers.some((u) => u.email.toLowerCase() === email.toLowerCase())
        ) {
          setErr("Este e-mail já está cadastrado.")
          setLoading(false)
          return
        }

        localUsers.push({
          email,
          password: pass,
          name,
          phone,
          role: "colaborador",
          approved: false,
        })

        localStorage.setItem("offline_users", JSON.stringify(localUsers))

        const offlineCollabs = JSON.parse(
          localStorage.getItem("offline_collaborators") || "[]",
        )
        offlineCollabs.push({
          id: Date.now().toString(),
          name,
          role: "Pendente",
          phone,
          user_role: "colaborador",
          email,
          approved: false,
        })
        localStorage.setItem(
          "offline_collaborators",
          JSON.stringify(offlineCollabs),
        )

        setMode("pending")
      } catch {
        setErr("Erro ao salvar cadastro.")
      } finally {
        setLoading(false)
      }
    }
  }

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-5">
      <div className="w-full max-w-[380px]">
        <div className="text-center mb-5">
          <img
            src={bigsomLogo}
            alt="BigSom"
            className="mx-auto mb-4 w-30 max-w-full object-contain"
          />
        </div>

        {mode === "login" && (
          <form
            onSubmit={handleLogin}
            className="bg-[#0d0d0d] border border-neutral-900 rounded-2xl p-7"
          >
            <FormField label="E-mail">
              <Input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                required
              />
            </FormField>
            <FormField label="Senha">
              <Input
                value={pass}
                onChange={(e) => setPass(e.target.value)}
                type="password"
                required
              />
            </FormField>

            {err && <p className="text-[#d93434] text-xs mb-3">{err}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-white text-black hover:bg-neutral-250 transition-all rounded-lg py-3 text-xs font-semibold cursor-pointer disabled:bg-neutral-900 disabled:text-neutral-600 disabled:cursor-not-allowed mt-2"
            >
              {loading ? "Entrando..." : "Entrar"}
            </button>

            <div className="flex flex-col gap-2.5 items-center mt-4 text-xs">
              <button
                type="button"
                onClick={() => {
                  setMode("register")
                  setErr("")
                }}
                className="text-neutral-400 hover:text-white transition-colors cursor-pointer bg-transparent border-none outline-none font-medium"
              >
                Criar uma conta
              </button>
              <button
                type="button"
                className="text-neutral-650 hover:text-neutral-400 transition-colors cursor-pointer bg-transparent border-none outline-none"
              >
                Esqueci minha senha
              </button>
            </div>
          </form>
        )}

        {mode === "register" && (
          <form
            onSubmit={handleRegister}
            className="bg-[#0d0d0d] border border-neutral-900 rounded-2xl p-7 space-y-4"
          >
            <div className="mb-2">
              <h2 className="text-white text-base font-bold">
                Cadastrar Conta
              </h2>
              <p className="text-neutral-500 text-[11px] mt-0.5">
                Preencha seus dados para solicitar acesso.
              </p>
            </div>

            <FormField label="Nome Completo" required>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                type="text"
                placeholder="Ex: João Silva"
                required
              />
            </FormField>
            <FormField label="E-mail" required>
              <Input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                placeholder="seu-email@dominio.com"
                required
              />
            </FormField>
            <FormField label="Telefone">
              <Input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                type="phone"
                placeholder="(63) 99999-0000"
              />
            </FormField>
            <FormField label="Senha" required>
              <Input
                value={pass}
                onChange={(e) => setPass(e.target.value)}
                type="password"
                required
              />
            </FormField>
            <FormField label="Confirmar Senha" required>
              <Input
                value={confirmPass}
                onChange={(e) => setConfirmPass(e.target.value)}
                type="password"
                required
              />
            </FormField>

            {err && <p className="text-[#d93434] text-xs pt-1">{err}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-white text-black hover:bg-neutral-250 transition-all rounded-lg py-3 text-xs font-semibold cursor-pointer disabled:bg-neutral-900 disabled:text-neutral-600 disabled:cursor-not-allowed mt-2"
            >
              {loading ? "Cadastrando..." : "Solicitar Cadastro"}
            </button>

            <div className="text-center mt-2">
              <button
                type="button"
                onClick={() => {
                  setMode("login")
                  setErr("")
                }}
                className="text-neutral-450 hover:text-white text-xs transition-colors cursor-pointer bg-transparent border-none outline-none font-medium"
              >
                ← Voltar para o Login
              </button>
            </div>
          </form>
        )}

        {mode === "pending" && (
          <div className="bg-[#0d0d0d] border border-neutral-900 rounded-2xl p-7 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-[#1c1917] text-amber-500 flex items-center justify-center text-xl mx-auto mb-2">
              ⏳
            </div>
            <h2 className="text-white text-base font-bold">
              Solicitação Enviada!
            </h2>
            <p className="text-neutral-400 text-xs leading-relaxed">
              Sua conta foi criada, mas precisa ser **aprovada por um
              administrador** antes que você possa acessar o sistema.
            </p>
            <p className="text-neutral-500 text-[11px] leading-relaxed">
              Por favor, contate o gerente ou o administrador da BigSom para
              liberar seu acesso.
            </p>

            <button
              onClick={() => {
                setMode("login")
                setErr("")
                setEmail("")
                setPass("")
                setName("")
                setPhone("")
                setConfirmPass("")
              }}
              className="w-full bg-white text-black hover:bg-neutral-250 transition-all rounded-lg py-2.5 text-xs font-semibold cursor-pointer mt-4"
            >
              Voltar para o Login
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
