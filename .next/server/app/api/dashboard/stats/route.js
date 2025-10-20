"use strict";(()=>{var e={};e.id=41,e.ids=[41],e.modules={399:e=>{e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},517:e=>{e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},7974:(e,t,r)=>{r.r(t),r.d(t,{originalPathname:()=>O,patchFetch:()=>l,requestAsyncStorage:()=>c,routeModule:()=>b,serverHooks:()=>u,staticGenerationAsyncStorage:()=>m});var o={};r.r(o),r.d(o,{GET:()=>s});var a=r(9303),n=r(8716),i=r(670),d=r(7070);async function s(e){try{let{searchParams:t}=new URL(e.url),r=t.get("timeRange")||"7days",o=new Date,a=new Date;switch(r){case"7days":default:a.setDate(o.getDate()-7);break;case"30days":a.setMonth(o.getMonth()-1);break;case"90days":a.setMonth(o.getMonth()-3)}let[n,i,s,b,c,m]=await Promise.all([Object(function(){var e=Error("Cannot find module '../../../lib/db'");throw e.code="MODULE_NOT_FOUND",e}()).book.count(),Object(function(){var e=Error("Cannot find module '../../../lib/db'");throw e.code="MODULE_NOT_FOUND",e}()).member.count(),Object(function(){var e=Error("Cannot find module '../../../lib/db'");throw e.code="MODULE_NOT_FOUND",e}()).borrowing.count({where:{status:"BORROWED"}}),Object(function(){var e=Error("Cannot find module '../../../lib/db'");throw e.code="MODULE_NOT_FOUND",e}()).borrowing.count({where:{status:"BORROWED",dueDate:{lt:o}}}),Object(function(){var e=Error("Cannot find module '../../../lib/db'");throw e.code="MODULE_NOT_FOUND",e}()).reservation.count({where:{status:"WAITING"}}),Object(function(){var e=Error("Cannot find module '../../../lib/db'");throw e.code="MODULE_NOT_FOUND",e}()).attendance.count({where:{checkInTime:{gte:new Date(o.getFullYear(),o.getMonth(),o.getDate()),lt:new Date(o.getFullYear(),o.getMonth(),o.getDate()+1)}}})]),[u,O,l,_]=await Promise.all([Object(function(){var e=Error("Cannot find module '../../../lib/db'");throw e.code="MODULE_NOT_FOUND",e}()).borrowing.count({where:{borrowDate:{gte:a}}}),Object(function(){var e=Error("Cannot find module '../../../lib/db'");throw e.code="MODULE_NOT_FOUND",e}()).borrowing.count({where:{returnDate:{gte:a}}}),Object(function(){var e=Error("Cannot find module '../../../lib/db'");throw e.code="MODULE_NOT_FOUND",e}()).attendance.count({where:{checkInTime:{gte:a}}}),Object(function(){var e=Error("Cannot find module '../../../lib/db'");throw e.code="MODULE_NOT_FOUND",e}()).reservation.count({where:{reservationDate:{gte:a}}})]),N=(await Object(function(){var e=Error("Cannot find module '../../../lib/db'");throw e.code="MODULE_NOT_FOUND",e}()).book.groupBy({by:["category"],_count:{category:!0},orderBy:{_count:{category:"desc"}},take:5})).map(e=>({name:e.category,count:e._count.category,percentage:n>0?(e._count.category/n*100).toFixed(1):"0.0"})),h=await Object(function(){var e=Error("Cannot find module '../../../lib/db'");throw e.code="MODULE_NOT_FOUND",e}()).$queryRaw`
      SELECT 
        'borrow' as type,
        b.borrow_date as timestamp,
        m.name as member_name,
        bk.title as book_title
      FROM borrowings b
      JOIN members m ON b.member_id = m.id
      JOIN books bk ON b.book_id = bk.id
      WHERE b.borrow_date >= ${a}
      
      UNION ALL
      
      SELECT 
        'return' as type,
        b.return_date as timestamp,
        m.name as member_name,
        bk.title as book_title
      FROM borrowings b
      JOIN members m ON b.member_id = m.id
      JOIN books bk ON b.book_id = bk.id
      WHERE b.return_date >= ${a}
      
      UNION ALL
      
      SELECT 
        'attendance' as type,
        a.check_in_time as timestamp,
        m.name as member_name,
        NULL as book_title
      FROM attendance a
      JOIN members m ON a.member_id = m.id
      WHERE a.check_in_time >= ${a}
      
      UNION ALL
      
      SELECT 
        'reservation' as type,
        r.reservation_date as timestamp,
        m.name as member_name,
        bk.title as book_title
      FROM reservations r
      JOIN members m ON r.member_id = m.id
      JOIN books bk ON r.book_id = bk.id
      WHERE r.reservation_date >= ${a}
      
      ORDER BY timestamp DESC
      LIMIT 10
    `;return d.NextResponse.json({totalBooks:n,availableBooks:n-s,totalMembers:i,activeLoans:s,overdueBooks:b,todayAttendance:m,pendingReservations:c,recentBorrowings:u,recentReturns:O,recentAttendance:l,recentReservations:_,popularCategories:N,recentActivities:h})}catch(e){return console.error("Get dashboard stats error:",e),d.NextResponse.json({error:"Failed to fetch dashboard statistics"},{status:500})}}!function(){var e=Error("Cannot find module '../../../lib/db'");throw e.code="MODULE_NOT_FOUND",e}();let b=new a.AppRouteRouteModule({definition:{kind:n.x.APP_ROUTE,page:"/api/dashboard/stats/route",pathname:"/api/dashboard/stats",filename:"route",bundlePath:"app/api/dashboard/stats/route"},resolvedPagePath:"C:\\Users\\USER\\Desktop\\Library Project\\app\\api\\dashboard\\stats\\route.ts",nextConfigOutput:"",userland:o}),{requestAsyncStorage:c,staticGenerationAsyncStorage:m,serverHooks:u}=b,O="/api/dashboard/stats/route";function l(){return(0,i.patchFetch)({serverHooks:u,staticGenerationAsyncStorage:m})}}};var t=require("../../../../webpack-runtime.js");t.C(e);var r=e=>t(t.s=e),o=t.X(0,[948,972],()=>r(7974));module.exports=o})();