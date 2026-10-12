"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { onAuthStateChanged, signOut } from "firebase/auth"
import { auth } from "@/lib/firebase"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const [ready, setReady] = useState(false)
  const [userEmail, setUserEmail] = useState("")

  useEffect(() => {
    const isLoginPage = pathname === "/admin/login"
    const adminUid = process.env.NEXT_PUBLIC_ADMIN_UID

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      const allowed = !!user && (!adminUid || user.uid === adminUid)

      if (allowed) {
        setUserEmail(user!.email || "")
        setReady(true)
        return
      }

      setUserEmail("")
      if (isLoginPage) {
        setReady(true)
      } else {
        setReady(false)
        router.replace("/admin/login")
      }
    })

    return () => unsubscribe()
  }, [pathname, router])

  async function logout() {
    await signOut(auth)
    router.replace("/admin/login")
  }

  if (!ready) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0f172a",
          color: "white",
        }}
      >
        Yükleniyor...
      </div>
    )
  }

  if (pathname === "/admin/login") {
    return <>{children}</>
  }

  return (
    <div className="adm-root">
      <style>{css}</style>

      <aside className="adm-side">
        <div className="adm-brandnav">
          <h2 className="adm-brand">Blore</h2>

          <nav className="adm-nav">
            <Link href="/admin/calendar" className="adm-link">
              📅 Takvim
            </Link>

            <Link href="/admin/settings" className="adm-link">
              ⚙️ Ayarlar
            </Link>
          </nav>
        </div>

        <button onClick={logout} className="adm-logout">
          Çıkış
        </button>
      </aside>

      <div className="adm-main">
        <header className="adm-top">
          <h3 style={{ margin: 0 }}>Admin Panel</h3>
          <div className="adm-user">{userEmail || "Admin"}</div>
        </header>

        <main className="adm-content">{children}</main>
      </div>
    </div>
  )
}

const css = `
.adm-root {
  display: flex;
  min-height: 100vh;
  background: #0f172a;
}
.adm-side {
  width: 240px;
  flex-shrink: 0;
  box-sizing: border-box;
  background: rgba(15,23,42,0.88);
  border-right: 1px solid rgba(255,255,255,0.08);
  padding: 24px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
.adm-brand {
  color: white;
  margin: 0;
}
.adm-nav {
  display: grid;
  gap: 10px;
  margin-top: 24px;
}
.adm-link {
  color: white;
  text-decoration: none;
  padding: 12px 14px;
  border-radius: 10px;
  background: rgba(255,255,255,0.04);
  font-weight: 600;
}
.adm-logout {
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 12px;
  padding: 12px 16px;
  cursor: pointer;
  font-weight: 700;
}
.adm-main {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}
.adm-top {
  height: 70px;
  background: rgba(255,255,255,0.05);
  border-bottom: 1px solid rgba(255,255,255,0.08);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  color: white;
}
.adm-user {
  background: rgba(255,255,255,0.08);
  padding: 8px 14px;
  border-radius: 999px;
  font-size: 14px;
}
.adm-content {
  flex: 1;
  padding: 24px;
  overflow: auto;
  min-width: 0;
}

@media (max-width: 768px) {
  .adm-root {
    flex-direction: column;
  }
  .adm-side {
    width: 100%;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    padding: 10px 12px;
    border-right: none;
    border-bottom: 1px solid rgba(255,255,255,0.08);
  }
  .adm-brandnav {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .adm-brand {
    font-size: 18px;
  }
  .adm-nav {
    display: flex;
    gap: 6px;
    margin-top: 0;
  }
  .adm-link {
    padding: 8px 10px;
    font-size: 14px;
  }
  .adm-logout {
    padding: 8px 12px;
    font-size: 14px;
  }
  .adm-top {
    display: none;
  }
  .adm-content {
    padding: 8px;
  }
}
`