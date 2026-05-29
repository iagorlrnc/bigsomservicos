import { useState, useEffect, useCallback } from "react"
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { AuthProvider, useAuth } from "./context/AuthContext"
import { supabase } from "./lib/supabaseClient"

// Components & Pages
import Sidebar from "./components/Sidebar"
import Toast from "./components/Toast"
import LoginPage from "./pages/LoginPage"
import DashboardPage from "./pages/DashboardPage"
import VehiclesPage from "./pages/VehiclesPage"
import VehicleDetailsPage from "./pages/VehicleDetailsPage"
import ServicesPage from "./pages/ServicesPage"
import OwnersPage from "./pages/OwnersPage"
import CollaboratorPage from "./pages/CollaboratorPage"
import CollaboratorsPage from "./pages/CollaboratorsPage"
import bigsomLogo from "./public/assets/bigsomlogo.png"

// MOCK DATA FOR DEMO FALLBACK
const MOCK_VEHICLES = [
  {
    id: "1",
    plate: "ABC-1234",
    brand: "Toyota",
    model: "Corolla",
    year: 2021,
    color: "Prata",
    owner_name: "Carlos Mendes",
    owner_phone: "(63) 99812-3456",
    created_at: "2024-06-01T10:00:00Z",
  },
  {
    id: "2",
    plate: "DEF-5678",
    brand: "Honda",
    model: "Civic",
    year: 2022,
    color: "Preto",
    owner_name: "Ana Paula Silva",
    owner_phone: "(63) 99723-4567",
    created_at: "2024-06-05T11:30:00Z",
  },
  {
    id: "3",
    plate: "GHI-9012",
    brand: "Volkswagen",
    model: "Golf",
    year: 2020,
    color: "Branco",
    owner_name: "Roberto Lima",
    owner_phone: "(63) 99634-5678",
    created_at: "2024-06-10T09:15:00Z",
  },
  {
    id: "4",
    plate: "JKL-3456",
    brand: "Chevrolet",
    model: "Onix",
    year: 2023,
    color: "Vermelho",
    owner_name: "Fernanda Costa",
    owner_phone: "(63) 99545-6789",
    created_at: "2024-06-15T14:00:00Z",
  },
  {
    id: "5",
    plate: "MNO-7890",
    brand: "Ford",
    model: "Ka",
    year: 2019,
    color: "Azul",
    owner_name: "Marcos Oliveira",
    owner_phone: "(63) 99456-7890",
    created_at: "2024-06-18T16:30:00Z",
  },
]

const MOCK_SERVICES = [
  {
    id: "s1",
    vehicle_id: "1",
    name: "Instalação de Som",
    description: "Central multimídia Pioneer com Android Auto",
    value: 1200,
    status: "finalizado",
    created_at: "2024-06-02T10:00:00Z",
    completed_at: "2024-06-03T15:00:00Z",
    responsible: "João Silva",
    notes: "Cliente satisfeito",
  },
  {
    id: "s2",
    vehicle_id: "1",
    name: "Troca de Alto Falantes",
    description: "Alto falantes Selenium 6x9 traseiros",
    value: 350,
    status: "finalizado",
    created_at: "2024-06-02T10:00:00Z",
    completed_at: "2024-06-03T15:00:00Z",
    responsible: "Pedro Costa",
    notes: "",
  },
  {
    id: "s3",
    vehicle_id: "2",
    name: "Instalação Multimídia",
    description: "Tela 9 polegadas com câmera de ré",
    value: 1800,
    status: "em_andamento",
    created_at: "2024-06-06T09:00:00Z",
    completed_at: null,
    responsible: "João Silva",
    notes: "Aguardando peça",
  },
  {
    id: "s4",
    vehicle_id: "3",
    name: "Insulfilm",
    description: "Insulfilm G05 completo",
    value: 600,
    status: "finalizado",
    created_at: "2024-06-11T08:00:00Z",
    completed_at: "2024-06-12T12:00:00Z",
    responsible: "Lucas Mendes",
    notes: "",
  },
  {
    id: "s5",
    vehicle_id: "4",
    name: "LED Automotivo",
    description: "Kit LED H4 faróis dianteiros",
    value: 280,
    status: "em_andamento",
    created_at: "2024-06-16T10:00:00Z",
    completed_at: null,
    responsible: "Pedro Costa",
    notes: "",
  },
  {
    id: "s6",
    vehicle_id: "5",
    name: "Elétrica Automotiva",
    description: "Revisão completa do sistema elétrico",
    value: 450,
    status: "aguardando",
    created_at: "2024-06-19T09:00:00Z",
    completed_at: null,
    responsible: "João Silva",
    notes: "",
  },
  {
    id: "s7",
    vehicle_id: "2",
    name: "Troca de Alto Falantes",
    description: "Alto falantes frontais 6 polegadas",
    value: 320,
    status: "aguardando",
    created_at: "2024-06-06T09:00:00Z",
    completed_at: null,
    responsible: "Lucas Mendes",
    notes: "",
  },
]

const MOCK_COLLABORATORS = [
  {
    id: "c1",
    name: "João Silva",
    role: "Mecânico",
    phone: "(63) 99234-5678",
    approved: true,
    user_role: "colaborador",
  },
  {
    id: "c2",
    name: "Pedro Costa",
    role: "Mecânico",
    phone: "(63) 99123-4567",
    approved: true,
    user_role: "colaborador",
  },
  {
    id: "c3",
    name: "Lucas Mendes",
    role: "Eletricista",
    phone: "(63) 99345-6789",
    approved: true,
    user_role: "colaborador",
  },
]

const getInitialCollaborators = () => {
  const offlineCollabs = localStorage.getItem("offline_collaborators")
  if (offlineCollabs) {
    try {
      const parsed = JSON.parse(offlineCollabs)
      const merged = [...MOCK_COLLABORATORS]
      parsed.forEach((c) => {
        if (
          !merged.some(
            (mc) =>
              mc.id === c.id ||
              (c.email && mc.email?.toLowerCase() === c.email?.toLowerCase()),
          )
        ) {
          merged.push(c)
        }
      })
      return merged
    } catch (e) {
      console.error(e)
    }
  }
  return MOCK_COLLABORATORS
}

function AppContent() {
  const { user, loading: authLoading } = useAuth()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // App lists state
  const [vehicles, setVehicles] = useState(() => {
    const archivedList = JSON.parse(
      localStorage.getItem("offline_archived_vehicles") || "[]",
    )
    return MOCK_VEHICLES.map((v) =>
      archivedList.includes(v.id) ? { ...v, archived: true } : v,
    )
  })
  const [services, setServices] = useState(MOCK_SERVICES)
  const [collaborators, setCollaborators] = useState(getInitialCollaborators)
  const [toasts, setToasts] = useState([])
  const [dbLoading, setDbLoading] = useState(false)

  const addToast = useCallback((message, type = "info") => {
    const id = Date.now()
    setToasts((t) => [...t, { id, message, type }])
    setTimeout(() => setToasts((t) => t.filter((tt) => tt.id !== id)), 3500)
  }, [])

  // Check if Supabase keys have been configured with real values
  const isSupabaseConfigured =
    import.meta.env.VITE_SUPABASE_URL &&
    import.meta.env.VITE_SUPABASE_URL.indexOf("your-project-id") === -1 &&
    import.meta.env.VITE_SUPABASE_ANON_KEY &&
    import.meta.env.VITE_SUPABASE_ANON_KEY.indexOf("your-anon-key") === -1

  // Fetch real data from Supabase if configured
  useEffect(() => {
    if (!user || !isSupabaseConfigured) return

    const loadData = async () => {
      setDbLoading(true)
      try {
        // Fetch vehicles
        const { data: dbVehicles, error: vError } = await supabase
          .from("vehicles")
          .select("*")
          .order("created_at", { ascending: false })

        if (vError) throw vError
        setVehicles(dbVehicles || [])

        // Fetch services
        const { data: dbServices, error: sError } = await supabase
          .from("services")
          .select("*")
          .order("created_at", { ascending: false })

        if (sError) throw sError
        setServices(dbServices || [])

        // Fetch collaborators
        const { data: dbCollaborators, error: cError } = await supabase
          .from("collaborators")
          .select("*")
          .order("name", { ascending: true })

        if (cError) throw cError
        setCollaborators(dbCollaborators || [])
      } catch (err) {
        console.error("Erro ao carregar dados do Supabase:", err)
        addToast("Erro ao sincronizar com banco de dados real.", "error")
      } finally {
        setDbLoading(false)
      }
    }

    loadData()
  }, [user, isSupabaseConfigured, addToast])

  const handleAddVehicle = async (vForm) => {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from("vehicles")
        .insert([
          {
            plate: vForm.plate,
            brand: vForm.brand,
            model: vForm.model,
            year: parseInt(vForm.year),
            color: vForm.color,
            owner_name: vForm.owner_name,
            owner_phone: vForm.owner_phone,
          },
        ])
        .select()

      if (error) throw error
      if (data && data[0]) {
        setVehicles((prev) => [data[0], ...prev])
      }
    } else {
      // Offline mock insert
      const newV = {
        ...vForm,
        id: Date.now().toString(),
        year: parseInt(vForm.year),
        created_at: new Date().toISOString(),
      }
      setVehicles((prev) => [newV, ...prev])
    }
  }

  const handleUpdateVehicle = async (id, updates) => {
    if (isSupabaseConfigured) {
      const { error } = await supabase
        .from("vehicles")
        .update(updates)
        .eq("id", id)

      if (error) throw error
      setVehicles((prev) =>
        prev.map((v) => (v.id === id ? { ...v, ...updates } : v)),
      )
    } else {
      setVehicles((prev) =>
        prev.map((v) => (v.id === id ? { ...v, ...updates } : v)),
      )
    }
  }

  const handleArchiveVehicle = async (id) => {
    if (isSupabaseConfigured) {
      const { error } = await supabase
        .from("vehicles")
        .update({ archived: true })
        .eq("id", id)

      if (error) throw error
      setVehicles((prev) =>
        prev.map((v) => (v.id === id ? { ...v, archived: true } : v)),
      )
    } else {
      // Offline mock archive
      setVehicles((prev) =>
        prev.map((v) => (v.id === id ? { ...v, archived: true } : v)),
      )

      const archivedList = JSON.parse(
        localStorage.getItem("offline_archived_vehicles") || "[]",
      )
      archivedList.push(id)
      localStorage.setItem(
        "offline_archived_vehicles",
        JSON.stringify(archivedList),
      )
    }
  }

  const handleDeleteVehicle = async (id) => {
    if (isSupabaseConfigured) {
      const { error: servicesError } = await supabase
        .from("services")
        .delete()
        .eq("vehicle_id", id)

      if (servicesError) throw servicesError

      const { error } = await supabase.from("vehicles").delete().eq("id", id)

      if (error) throw error
      setVehicles((prev) => prev.filter((v) => v.id !== id))
      setServices((prev) => prev.filter((s) => s.vehicle_id !== id))
    } else {
      setVehicles((prev) => prev.filter((v) => v.id !== id))
      setServices((prev) => prev.filter((s) => s.vehicle_id !== id))
    }
  }

  const handleAddService = async (sForm) => {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from("services")
        .insert([
          {
            vehicle_id: sForm.vehicle_id,
            name: sForm.name,
            description: sForm.description,
            value: parseFloat(sForm.value),
            status: sForm.status,
            responsible: sForm.responsible,
          },
        ])
        .select()

      if (error) throw error
      if (data && data[0]) {
        setServices((prev) => [data[0], ...prev])
      }
    } else {
      // Offline mock insert
      const newS = {
        ...sForm,
        id: Date.now().toString(),
        value: parseFloat(sForm.value),
        created_at: new Date().toISOString(),
        completed_at: null,
      }
      setServices((prev) => [newS, ...prev])
    }
  }

  const handleUpdateService = async (id, updates) => {
    if (isSupabaseConfigured) {
      const { error } = await supabase
        .from("services")
        .update(updates)
        .eq("id", id)

      if (error) throw error
      setServices((prev) =>
        prev.map((s) => (s.id === id ? { ...s, ...updates } : s)),
      )
    } else {
      // Offline mock update
      setServices((prev) =>
        prev.map((s) => (s.id === id ? { ...s, ...updates } : s)),
      )
    }
  }

  const handleDeleteService = async (id) => {
    if (isSupabaseConfigured) {
      const { error } = await supabase.from("services").delete().eq("id", id)

      if (error) throw error
      setServices((prev) => prev.filter((s) => s.id !== id))
    } else {
      setServices((prev) => prev.filter((s) => s.id !== id))
    }
  }

  const handleAddCollaborator = async (cForm) => {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from("collaborators")
        .insert([
          {
            name: cForm.name,
            role: cForm.role,
            phone: cForm.phone,
            approved: true,
            user_role: "colaborador",
          },
        ])
        .select()

      if (error) throw error
      if (data && data[0]) {
        setCollaborators((prev) => [...prev, data[0]])
      }
    } else {
      // Offline mock insert
      const newC = {
        ...cForm,
        id: Date.now().toString(),
        approved: true,
        user_role: "colaborador",
        created_at: new Date().toISOString(),
      }
      setCollaborators((prev) => [...prev, newC])

      const storedCollabs = JSON.parse(
        localStorage.getItem("offline_collaborators") || "[]",
      )
      storedCollabs.push(newC)
      localStorage.setItem(
        "offline_collaborators",
        JSON.stringify(storedCollabs),
      )
    }
  }

  const handleApproveCollaborator = async (id, userRole) => {
    if (isSupabaseConfigured) {
      const { error } = await supabase
        .from("collaborators")
        .update({
          approved: true,
          user_role: userRole,
          role: userRole === "admin" ? "Gerente" : "Membro da equipe",
        })
        .eq("id", id)

      if (error) throw error

      setCollaborators((prev) =>
        prev.map((c) =>
          c.id === id
            ? {
                ...c,
                approved: true,
                user_role: userRole,
                role: userRole === "admin" ? "Gerente" : "Membro da equipe",
              }
            : c,
        ),
      )
    } else {
      // Offline mock approval
      const storedCollabs = JSON.parse(
        localStorage.getItem("offline_collaborators") || "[]",
      )
      const collabIdx = storedCollabs.findIndex((c) => c.id === id)
      let updatedEmail = ""
      if (collabIdx !== -1) {
        storedCollabs[collabIdx].approved = true
        storedCollabs[collabIdx].user_role = userRole
        storedCollabs[collabIdx].role =
          userRole === "admin" ? "Gerente" : "Membro da equipe"
        updatedEmail = storedCollabs[collabIdx].email
        localStorage.setItem(
          "offline_collaborators",
          JSON.stringify(storedCollabs),
        )
      }

      if (updatedEmail) {
        const storedUsers = JSON.parse(
          localStorage.getItem("offline_users") || "[]",
        )
        const userIdx = storedUsers.findIndex(
          (u) => u.email.toLowerCase() === updatedEmail.toLowerCase(),
        )
        if (userIdx !== -1) {
          storedUsers[userIdx].approved = true
          storedUsers[userIdx].role = userRole
          localStorage.setItem("offline_users", JSON.stringify(storedUsers))
        }
      }

      setCollaborators((prev) =>
        prev.map((c) =>
          c.id === id
            ? {
                ...c,
                approved: true,
                user_role: userRole,
                role: userRole === "admin" ? "Gerente" : "Membro da equipe",
              }
            : c,
        ),
      )
    }
  }

  const handleRejectCollaborator = async (id) => {
    if (isSupabaseConfigured) {
      const { error } = await supabase
        .from("collaborators")
        .delete()
        .eq("id", id)

      if (error) throw error
      setCollaborators((prev) => prev.filter((c) => c.id !== id))
    } else {
      // Offline mock rejection
      const storedCollabs = JSON.parse(
        localStorage.getItem("offline_collaborators") || "[]",
      )
      const collab = storedCollabs.find((c) => c.id === id)

      const filteredCollabs = storedCollabs.filter((c) => c.id !== id)
      localStorage.setItem(
        "offline_collaborators",
        JSON.stringify(filteredCollabs),
      )

      if (collab?.email) {
        const storedUsers = JSON.parse(
          localStorage.getItem("offline_users") || "[]",
        )
        const filteredUsers = storedUsers.filter(
          (u) => u.email.toLowerCase() !== collab.email.toLowerCase(),
        )
        localStorage.setItem("offline_users", JSON.stringify(filteredUsers))
      }

      setCollaborators((prev) => prev.filter((c) => c.id !== id))
    }
  }

  // Offline mock bypass authorization state
  const isOfflineAuthed = sessionStorage.getItem("offline_auth") === "true"

  if (authLoading && isSupabaseConfigured) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="w-10 h-10 border-t-2 border-white border-solid rounded-full animate-spin"></div>
      </div>
    )
  }

  // Handle Authentication Flow
  if (isSupabaseConfigured) {
    if (!user) {
      return <LoginPage />
    }
  } else {
    // Demo Mode Offline Auth bypass check
    if (!isOfflineAuthed) {
      return <LoginPage />
    }
  }

  // Loading database records before checking approval status
  if (isSupabaseConfigured && user && dbLoading && collaborators.length === 0) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="w-10 h-10 border-t-2 border-white border-solid rounded-full animate-spin"></div>
      </div>
    )
  }

  const myCollabProfile = collaborators.find((c) => c.user_id === user?.id)
  const offlineEmail = sessionStorage.getItem("offline_email") || ""
  const currentCollaboratorName =
    myCollabProfile?.name ||
    (!isSupabaseConfigured && offlineEmail
      ? collaborators.find(
          (c) =>
            c.email && c.email.toLowerCase() === offlineEmail.toLowerCase(),
        )?.name
      : "")
  const isApproved =
    !user ||
    user.email === "admin@bigsom.com" ||
    (myCollabProfile && myCollabProfile.approved === true)

  if (isSupabaseConfigured && user && !isApproved) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center p-5 text-[#ccc] font-sans">
        <div className="bg-[#0d0d0d] border border-neutral-900 rounded-2xl p-7 text-center max-w-[380px] space-y-4 shadow-xl">
          <div className="w-12 h-12 rounded-full bg-[#1c1917] text-amber-500 flex items-center justify-center text-xl mx-auto mb-2">
            ⏳
          </div>
          <h2 className="text-white text-base font-bold">
            Conta Aguardando Liberação
          </h2>
          <p className="text-neutral-400 text-xs leading-relaxed">
            Seu cadastro foi realizado com sucesso sob o e-mail{" "}
            <span className="text-white font-medium">{user.email}</span>.
          </p>
          <p className="text-neutral-500 text-[11px] leading-relaxed">
            Um administrador precisa aprovar sua conta antes que você possa
            navegar pela oficina.
          </p>

          <button
            onClick={async () => {
              try {
                await supabase.auth.signOut()
                window.location.reload()
              } catch (e) {
                console.error(e)
              }
            }}
            className="w-full bg-white text-black hover:bg-neutral-250 transition-all rounded-lg py-2.5 text-xs font-semibold cursor-pointer mt-4"
          >
            Sair da Conta ⎋
          </button>
        </div>
      </div>
    )
  }

  // Determine user role (email based for online, sessionStorage based for offline)
  const isAdmin = isSupabaseConfigured
    ? user &&
      (user.email === "admin@bigsom.com" ||
        (myCollabProfile && myCollabProfile.user_role === "admin"))
    : sessionStorage.getItem("offline_role") === "admin"

  if (!isAdmin) {
    // For collaborator panel, only show active (non-archived) vehicles and their services
    const collabActiveVehicles = vehicles.filter((v) => v.archived !== true)
    const collabActiveVehicleIds = new Set(
      collabActiveVehicles.map((v) => v.id),
    )
    const collabActiveServices = services.filter((s) =>
      collabActiveVehicleIds.has(s.vehicle_id),
    )

    return (
      <div className="min-h-screen bg-[#050505] text-[#ccc] font-sans">
        {!isSupabaseConfigured && (
          <div className="sticky top-0 z-[49] bg-amber-500/10 border-b border-amber-500/20 text-amber-500 text-[11px] font-semibold text-center py-2 px-4 flex items-center justify-center gap-2">
            <span>
              ⚠️ Modo de Demonstração (Dados Fictícios). Configure as
              credenciais no arquivo `.env` para conectar ao Supabase real.
            </span>
          </div>
        )}
        <Routes>
          <Route
            path="/colaborador"
            element={
              <CollaboratorPage
                vehicles={collabActiveVehicles}
                services={collabActiveServices}
                updateService={handleUpdateService}
                addToast={addToast}
                collaboratorName={currentCollaboratorName}
              />
            }
          />
          <Route
            path="/colaborador/:plate"
            element={
              <CollaboratorPage
                vehicles={collabActiveVehicles}
                services={collabActiveServices}
                updateService={handleUpdateService}
                addToast={addToast}
                collaboratorName={currentCollaboratorName}
              />
            }
          />
          <Route path="*" element={<Navigate to="/colaborador" replace />} />
        </Routes>
        <Toast
          toasts={toasts}
          remove={(id) => setToasts((t) => t.filter((tt) => tt.id !== id))}
        />
      </div>
    )
  }

  const sidebarWidth = sidebarCollapsed ? "lg:pl-[72px]" : "lg:pl-[238px]"

  // Filter for only approved collaborators to show in dropdowns and details
  const approvedCollaborators = collaborators.filter(
    (c) => c.approved !== false,
  )

  // Filter for only active (non-archived) vehicles to show on all dashboard/pages
  const activeVehicles = vehicles.filter((v) => v.archived !== true)
  const activeVehicleIds = new Set(activeVehicles.map((v) => v.id))

  // Hide services linked to archived vehicles across the admin UI
  const activeServices = services.filter((s) =>
    activeVehicleIds.has(s.vehicle_id),
  )

  const props = {
    vehicles: activeVehicles,
    services: activeServices,
    dashboardServices: services,
    collaborators: approvedCollaborators,
    addToast,
    addVehicle: handleAddVehicle,
    updateVehicle: handleUpdateVehicle,
    deleteVehicle: handleDeleteVehicle,
    addService: handleAddService,
    updateService: handleUpdateService,
    deleteService: handleDeleteService,
    addCollaborator: handleAddCollaborator,
    archiveVehicle: handleArchiveVehicle,
    dbLoading,
  }

  const userEmail =
    user?.email ||
    (isSupabaseConfigured
      ? ""
      : sessionStorage.getItem("offline_email") || "admin@bigsom.com")
  const userInitials = userEmail ? userEmail.charAt(0).toUpperCase() : "A"

  return (
    <div className="min-h-screen bg-[#050505] text-[#ccc] font-sans flex flex-col lg:block">
      {/* Top Demo Banner if Supabase is not configured yet */}
      {!isSupabaseConfigured && (
        <div className="sticky top-0 z-[49] bg-amber-500/10 border-b border-amber-500/20 text-amber-500 text-[11px] font-semibold text-center py-2 px-4 flex items-center justify-center gap-2">
          <span>
            ⚠️ Modo de Demonstração (Dados Fictícios). Configure as credenciais
            no arquivo `.env` para conectar ao Supabase real.
          </span>
        </div>
      )}

      {/* Mobile Top Navbar */}
      <header className="lg:hidden bg-[#080808] border-b border-neutral-900 px-4 py-3 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="text-neutral-450 hover:text-white cursor-pointer text-xl p-1 bg-transparent border-none outline-none"
          >
            ≡
          </button>
          <img
            src={bigsomLogo}
            alt="BigSom"
            className="w-7 h-7 object-contain"
          />
          <span className="text-white font-bold text-xs tracking-wider">
            BIGSOM
          </span>
        </div>

        <div className="w-7 h-7 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-450 text-[10px] font-semibold">
          {userInitials}
        </div>
      </header>

      <Sidebar
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
        mobileOpen={mobileMenuOpen}
        setMobileOpen={setMobileMenuOpen}
      />

      <main
        className={`${sidebarWidth} transition-all duration-300 p-4 sm:p-8 min-h-screen relative flex-1`}
      >
        <Routes>
          <Route path="/painel" element={<DashboardPage {...props} />} />
          <Route path="/veiculos" element={<VehiclesPage {...props} />} />
          <Route
            path="/veiculos/:plate"
            element={<VehicleDetailsPage {...props} />}
          />
          <Route path="/servicos" element={<ServicesPage {...props} />} />
          <Route path="/proprietarios" element={<OwnersPage {...props} />} />
          <Route
            path="/colaboradores"
            element={
              <CollaboratorsPage
                collaborators={collaborators}
                addCollaborator={handleAddCollaborator}
                approveCollaborator={handleApproveCollaborator}
                rejectCollaborator={handleRejectCollaborator}
                addToast={addToast}
              />
            }
          />
          <Route path="*" element={<Navigate to="/painel" replace />} />
        </Routes>
      </main>

      <Toast
        toasts={toasts}
        remove={(id) => setToasts((t) => t.filter((tt) => tt.id !== id))}
      />
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  )
}
