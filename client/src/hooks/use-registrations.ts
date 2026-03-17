import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { z } from "zod";

type InsertRegistration = z.infer<typeof api.registrations.create.input>;

export function useRegistrations() {
  return useQuery({
    queryKey: [api.registrations.list.path],
    queryFn: async () => {
      const res = await fetch(api.registrations.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch registrations");
      // Coerce the response into the expected type
      return api.registrations.list.responses[200].parse(await res.json());
    },
  });
}

export function useDeleteRegistration() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/registrations/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Erro ao apagar registo");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.registrations.list.path] });
    },
  });
}

export function useCreateRegistration() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertRegistration) => {
      const res = await fetch(api.registrations.create.path, {
        method: api.registrations.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        if (res.status === 400) {
          const error = api.registrations.create.responses[400].parse(await res.json());
          throw new Error(error.message || "Dados inválidos");
        }
        throw new Error("Erro ao registar");
      }
      return res.json(); 
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.registrations.list.path] });
    },
  });
}
