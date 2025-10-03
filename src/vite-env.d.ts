/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL?: string;
  readonly VITE_SUPABASE_URL?: string;
  readonly VITE_SUPABASE_ANON_KEY?: string;
  // добавьте другие переменные окружения здесь
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module '*.js' {
  const content: any;
  export default content;
}

declare module './api/stories.js' {
  export const getStories: () => Promise<any>;
  export const getAllStories: () => Promise<any>;
  export const addStory: (story: any) => Promise<any>;
  export const updateStory: (id: string, story: any) => Promise<any>;
  export const deleteStory: (id: string) => Promise<any>;
}

declare module './developerTools.js' {
  const devTools: any;
  export default devTools;
}

declare module './supabaseClient.js' {
  export const supabase: any;
  export const knowledgeBase: any;
  export const botCorrections: any;
  export const testConnection: any;
  export const users: any;
  export const supabaseAdmin: any;
  export const chatHistory: any;
  export const agentSettings: any;
  export const modelSettings: any;
  export const userLimits: any;
  export const dialogsDB: any;
  export const statsAPI: any;
}

