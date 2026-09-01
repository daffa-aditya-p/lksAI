"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Card } from "@/components/ui";
import { useToast } from "@/components/Toast";
import { buatUser, hapusUser } from "@/app/actions/admin";

export interface UserRow {
  id: string;
  username: string;
  role: "ADMIN" | "RELAWAN";
  createdAt: string;
}

export function UserPanel({ users }: { users: UserRow[] }) {
  const router = useRouter();
  const { show } = useToast();
  const [userList, setUserList] = useState<UserRow[]>(users);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"RELAWAN" | "ADMIN">("RELAWAN");
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    setUserList(users);
  }, [users]);

  async function tambah() {
    if (!username.trim() || password.length < 6) {
      show("Username wajib diisi dan password minimal 6 karakter", "error");
      return;
    }
    setLoading(true);
    const res = await buatUser({ username, password, role });
    setLoading(false);
    if (res.ok) {
      show("Akun berhasil dibuat", "success");
      setUsername("");
      setPassword("");
      router.refresh();
    } else {
      show(res.error ?? "Gagal membuat akun", "error");
    }
  }

  async function hapus(u: UserRow) {
    if (!confirm(`Hapus akun ${u.username}?`)) return;
    setDeletingId(u.id);
    const res = await hapusUser(u.id);
    setDeletingId(null);
    if (res.ok) {
      show("Akun berhasil dihapus", "success");
      setUserList((prev) => prev.filter((item) => item.id !== u.id));
      router.refresh();
    } else {
      show(res.error ?? "Gagal menghapus akun", "error");
    }
  }

  return (
    <Card>
      <h2 className="mb-3 text-base font-bold text-slate-900">Kelola Akun</h2>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-4">
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="username"
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-pmi"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="password (min 6)"
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-pmi"
        />
        <select
          value={role}
          onChange={(e) => setRole(e.target.value as "RELAWAN" | "ADMIN")}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-pmi"
        >
          <option value="RELAWAN">RELAWAN</option>
          <option value="ADMIN">ADMIN</option>
        </select>
        <Button onClick={tambah} loading={loading}>
          Tambah Akun
        </Button>
      </div>

      <ul className="mt-3 divide-y divide-slate-100">
        {userList.map((u) => (
          <li key={u.id} className="flex items-center justify-between py-2 text-sm">
            <span>
              <b>{u.username}</b>{" "}
              <span className="rounded bg-slate-100 px-1.5 py-0.5 text-xs text-slate-500">
                {u.role}
              </span>
            </span>
            <Button
              variant="ghost"
              onClick={() => hapus(u)}
              loading={deletingId === u.id}
              className="!min-h-[32px] !px-2 !py-1 text-xs text-rose-600 hover:bg-rose-50"
            >
              Hapus
            </Button>
          </li>
        ))}
      </ul>
    </Card>
  );
}
