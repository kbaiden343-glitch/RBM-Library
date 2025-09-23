"use strict";(()=>{var e={};e.id=41,e.ids=[41],e.modules={399:e=>{e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},517:e=>{e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},7974:(e,t,a)=>{a.r(t),a.d(t,{originalPathname:()=>l,patchFetch:()=>_,requestAsyncStorage:()=>u,routeModule:()=>d,serverHooks:()=>p,staticGenerationAsyncStorage:()=>c});var r={};a.r(r),a.d(r,{GET:()=>b});var o=a(9303),s=a(8716),n=a(670),i=a(7070),m=a(2663);async function b(e){try{let{searchParams:t}=new URL(e.url),a=t.get("timeRange")||"7days",r=new Date,o=new Date;switch(a){case"7days":default:o.setDate(r.getDate()-7);break;case"30days":o.setMonth(r.getMonth()-1);break;case"90days":o.setMonth(r.getMonth()-3)}let[s,n,b,d,u,c]=await Promise.all([m._.book.count(),m._.member.count(),m._.borrowing.count({where:{status:"BORROWED"}}),m._.borrowing.count({where:{status:"BORROWED",dueDate:{lt:r}}}),m._.reservation.count({where:{status:"WAITING"}}),m._.attendance.count({where:{checkInTime:{gte:new Date(r.getFullYear(),r.getMonth(),r.getDate()),lt:new Date(r.getFullYear(),r.getMonth(),r.getDate()+1)}}})]),[p,l,_,g]=await Promise.all([m._.borrowing.count({where:{borrowDate:{gte:o}}}),m._.borrowing.count({where:{returnDate:{gte:o}}}),m._.attendance.count({where:{checkInTime:{gte:o}}}),m._.reservation.count({where:{reservationDate:{gte:o}}})]),h=(await m._.book.groupBy({by:["category"],_count:{category:!0},orderBy:{_count:{category:"desc"}},take:5})).map(e=>({name:e.category,count:e._count.category,percentage:s>0?(e._count.category/s*100).toFixed(1):"0.0"})),k=await m._.$queryRaw`
      SELECT 
        'borrow' as type,
        b.borrow_date as timestamp,
        m.name as member_name,
        bk.title as book_title
      FROM borrowings b
      JOIN members m ON b.member_id = m.id
      JOIN books bk ON b.book_id = bk.id
      WHERE b.borrow_date >= ${o}
      
      UNION ALL
      
      SELECT 
        'return' as type,
        b.return_date as timestamp,
        m.name as member_name,
        bk.title as book_title
      FROM borrowings b
      JOIN members m ON b.member_id = m.id
      JOIN books bk ON b.book_id = bk.id
      WHERE b.return_date >= ${o}
      
      UNION ALL
      
      SELECT 
        'attendance' as type,
        a.check_in_time as timestamp,
        m.name as member_name,
        NULL as book_title
      FROM attendance a
      JOIN members m ON a.member_id = m.id
      WHERE a.check_in_time >= ${o}
      
      UNION ALL
      
      SELECT 
        'reservation' as type,
        r.reservation_date as timestamp,
        m.name as member_name,
        bk.title as book_title
      FROM reservations r
      JOIN members m ON r.member_id = m.id
      JOIN books bk ON r.book_id = bk.id
      WHERE r.reservation_date >= ${o}
      
      ORDER BY timestamp DESC
      LIMIT 10
    `;return i.NextResponse.json({totalBooks:s,availableBooks:s-b,totalMembers:n,activeLoans:b,overdueBooks:d,todayAttendance:c,pendingReservations:u,recentBorrowings:p,recentReturns:l,recentAttendance:_,recentReservations:g,popularCategories:h,recentActivities:k})}catch(e){return console.error("Get dashboard stats error:",e),i.NextResponse.json({error:"Failed to fetch dashboard statistics"},{status:500})}}let d=new o.AppRouteRouteModule({definition:{kind:s.x.APP_ROUTE,page:"/api/dashboard/stats/route",pathname:"/api/dashboard/stats",filename:"route",bundlePath:"app/api/dashboard/stats/route"},resolvedPagePath:"C:\\Users\\USER\\Desktop\\Library Project\\app\\api\\dashboard\\stats\\route.ts",nextConfigOutput:"",userland:r}),{requestAsyncStorage:u,staticGenerationAsyncStorage:c,serverHooks:p}=d,l="/api/dashboard/stats/route";function _(){return(0,n.patchFetch)({serverHooks:p,staticGenerationAsyncStorage:c})}},2663:(e,t,a)=>{a.d(t,{_:()=>o});let r=require("@prisma/client"),o=globalThis.prisma??new r.PrismaClient({log:["error"]})}};var t=require("../../../../webpack-runtime.js");t.C(e);var a=e=>t(t.s=e),r=t.X(0,[948,972],()=>a(7974));module.exports=r})();