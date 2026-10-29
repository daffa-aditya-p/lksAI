"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Card } from "@/components/ui";
import { useToast } from "@/components/Toast";
import { buatUser, hapusUser } from "@/app/actions/admin";
import type { Role } from "@prisma/client";

export interface UserRow {
  id: string;
  username: string;
  role: Role;
  createdAt: string;
}

export function UserPanel({ users }: { users: UserRow[] }) {
  const router = useRouter();
  const { show } = useToast();
  const [userList, setUserList] = useState<UserRow[]>(users);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("RELAWAN");
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    setUserList(users);
  }, [users]);

  async function tambah() {
    if (!username.trim() || !password) {
      show("Username dan password wajib diisi", "error");
      return;
    }
    setLoading(true);
    const res = await buatUser({ username: username.trim(), password, role });
    setLoading(false);
    if (!res.ok) {
      show(res.error ?? "Gagal membuat user", "error");
      return;
    }
    show(`User ${username} (${role}) berhasil dibuat`, "success");
    setUsername("");
    setPassword("");
    router.refresh();
  }

  async function hapus(u: UserRow) {
    if (!confirm(`Hapus akun ${u.username} (${u.role})? Tindakan ini tidak bisa dibatalkan.`)) return;
    setDeletingId(u.id);
    const res = await hapusUser(u.id);
    setDeletingId(null);
    if (!res.ok) {
      show(res.error ?? "Gagal menghapus user", "error");
      return;
    }
    show(`Akun ${u.username} dihapus`, "success");
    router.refresh();
  }

  return (
    <Card className="p-4 sm:p-6 space-y-5">
      <div>
        <h3 className="font-bold text-slate-900 text-sm sm:text-base">Kelola Akun Petugas & User</h3>
        <p className="text-xs text-slate-500 mt-0.5">
          Buat atau hapus akun (Admin, Relawan, atau User).
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 items-end">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="mis. relawan_posko1"
            className="w-full text-xs rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-pmi"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="min. 6 karakter"
            className="w-full text-xs rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-pmi"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Role</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as Role)}
            className="w-full text-xs rounded-lg border border-slate-300 px-2.5 py-2 outline-none focus:border-pmi bg-white"
          >
            <option value="RELAWAN">RELAWAN</option>
            <option value="ADMIN">ADMIN</option>
            <option value="USER">USER</option>
          </select>
        </div>
        <div>
          <Button onClick={tambah} loading={loading} className="w-full !py-2 text-xs">
            + Tambah User
          </Button>
        </div>
      </div>

      <div className="border border-slate-200 rounded-lg overflow-hidden">
        <table className="w-full text-xs">
          <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 text-left">
            <tr>
              <th className="p-2.5">Username</th>
              <th className="p-2.5">Role</th>
              <th className="p-2.5 hidden sm:table-cell">Dibuat</th>
              <th className="p-2.5 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {userList.map((u) => (
              <tr key={u.id} className="hover:bg-slate-50/50">
                <td className="p-2.5 font-medium text-slate-800">{u.username}</td>
                <td className="p-2.5">
                  <span
                    className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                      u.role === "ADMIN"
                        ? "bg-red-100 text-red-700"
                        : u.role === "RELAWAN"
                        ? "bg-amber-100 text-amber-800"
                        : "bg-teal-100 text-teal-800"
                    }`}
                  >
                    {u.role}
                  </span>
                </td>
                <td className="p-2.5 text-slate-400 hidden sm:table-cell">
                  {new Date(u.createdAt).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </td>
                <td className="p-2.5 text-right">
                  <button
                    onClick={() => hapus(u)}
                    disabled={deletingId === u.id}
                    className="text-red-600 hover:text-red-800 font-semibold text-xs disabled:opacity-40"
                  >
                    {deletingId === u.id ? "Menghapus..." : "Hapus"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
