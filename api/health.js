import { neon } from '@neondatabase/serverless';
export default async function handler(req,res){
  res.setHeader('Cache-Control','no-store, max-age=0');
  try{
    if(!process.env.DATABASE_URL) return res.status(503).json({ok:false,database:false,error:'DATABASE_URL missing'});
    const sql=neon(process.env.DATABASE_URL);
    const rows=await sql`SELECT 1 AS ok`;
    return res.status(200).json({ok:rows[0]?.ok===1,database:true,adminPasswordConfigured:Boolean(process.env.ADMIN_PASSWORD)});
  }catch(e){return res.status(500).json({ok:false,database:false,error:'Database connection failed'});}
}
