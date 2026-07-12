import js from '@eslint/js';
import tseslint from 'typescript-eslint';
export default [js.configs.recommended,...tseslint.configs.recommended,{ignores:['dist/**','node_modules/**','site/**','wired-chaos-meta/**','wired-chaos-stack/**','.yarn/**'],rules:{'@typescript-eslint/no-explicit-any':'off'}}];
