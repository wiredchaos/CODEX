import { randomUUID } from 'node:crypto';
import { z } from 'zod';
export const bountySchema = z.object({ title:z.string().min(2), description:z.string().min(5), reward:z.string().min(1), status:z.enum(['OPEN','IN_REVIEW','APPROVED','PAID','CANCELLED']).default('OPEN') });
export const submissionSchema = z.object({ contributorId:z.string().min(1), contentUrl:z.string().url(), notes:z.string().optional() });
export class BountyService { bounties:any[]=[]; submissions:any[]=[]; list(){return this.bounties;} get(id:string){return this.bounties.find((b)=>b.id===id)??null;} create(input:z.infer<typeof bountySchema>){const bounty={id:`bounty_${randomUUID()}`,createdAt:new Date(),updatedAt:new Date(),...input};this.bounties.push(bounty);return bounty;} submit(bountyId:string,input:z.infer<typeof submissionSchema>){if(!this.get(bountyId)) return null; const sub={id:`sub_${randomUUID()}`,bountyId,status:'SUBMITTED',createdAt:new Date(),...input}; this.submissions.push(sub); return sub;} }
