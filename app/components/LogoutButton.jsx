   "use client"

import { signOut } from "next-auth/react"

   export default function LogoutButton() {
        return (
                <button onClick={signOut} className="mt-4 text-red-400">Log Out</button>
        )
    }