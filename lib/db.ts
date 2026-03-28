export const db = {
  run: async (query: string, params?: any[]) => {
    console.log("DB RUN:", query, params)
    return true
  },
}