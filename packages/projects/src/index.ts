import { randomUUID } from 'node:crypto';
import { z } from 'zod';
export const projectSchema = z.object({ name:z.string().min(2), description:z.string().min(5), ownerId:z.string().min(1), status:z.enum(['DRAFT','ACTIVE','PAUSED','COMPLETED']).default('DRAFT') });
export class ProjectService { projects:any[]=[]; list(){return this.projects;} get(id:string){return this.projects.find((p)=>p.id===id)??null;} create(input:z.infer<typeof projectSchema>){const project={id:`proj_${randomUUID()}`,createdAt:new Date(),updatedAt:new Date(),...input};this.projects.push(project);return project;} update(id:string,input:Partial<z.infer<typeof projectSchema>>){const p=this.get(id); if(!p) return null; Object.assign(p,input,{updatedAt:new Date()}); return p;} }
