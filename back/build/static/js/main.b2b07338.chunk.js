(this.webpackJsonptrailcam=this.webpackJsonptrailcam||[]).push([[0],{153:function(e,t,r){"use strict";r.r(t);var n=r(0),c=r.n(n),a=r(48),s=r.n(a),i=r(37),o=r(7),u=r.n(o),d=r(12),l=r(26),j=r(10),b=r(96),p=r(82),g=r(75),x=r(55),O=r(79),h=r(80),f=r(4),m=function(e){var t=e.loginUser,r=Object(n.useState)(!1),c=Object(l.a)(r,2),a=c[0],s=c[1],i=function(){var e=Object(d.a)(u.a.mark((function e(r){var n,c,a,s;return u.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return r.preventDefault(),n=r.target.elements,c=n.email,a=n.password,s={email:c.value,password:a.value},c.value="",a.value="",e.next=7,t(s);case 7:case"end":return e.stop()}}),e)})));return function(t){return e.apply(this,arguments)}}();return Object(f.jsx)(g.m,{children:Object(f.jsxs)("form",{name:"login-form",onSubmit:i,children:[Object(f.jsxs)(x.a,{id:"email",children:[Object(f.jsx)(x.b,{children:"Email"}),Object(f.jsx)(O.a,{variant:"outline",name:"email",type:"text",placeholder:"Email"})]}),Object(f.jsxs)(x.a,{id:"password",children:[Object(f.jsx)(x.b,{children:"Password"}),Object(f.jsxs)(O.b,{children:[Object(f.jsx)(O.a,{variant:"outline",name:"password",type:a?"text":"password",placeholder:"Password"}),Object(f.jsx)(O.c,{children:Object(f.jsx)(h.a,{onClick:function(){s(!a)},children:a?"Hide":"Show"})})]})]}),Object(f.jsx)(h.a,{variant:"solid",name:"login-button",type:"submit",children:"Login"})]})})},v=r(64),w=r(81),y=r(93),k=r(47),P=c.a.forwardRef((function(e,t){return Object(f.jsxs)(g.d,{as:"button",name:e.name,onClick:e.onClick,ref:t,children:[Object(f.jsx)(w.a,{name:e.children.props.children,size:"sm",src:""}),Object(f.jsx)(g.l,{children:e.children.props.children})]})})),D=function(e){var t=e.user,r=e.logout,n=function(){var e=Object(d.a)(u.a.mark((function e(){return u.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.next=2,r();case 2:case"end":return e.stop()}}),e)})));return function(){return e.apply(this,arguments)}}();return Object(f.jsx)(g.c,{alignItems:"center",justifyContent:"space-between",children:Object(f.jsxs)(y.a,{children:[Object(f.jsx)(y.b,{name:"user-avatar",as:P,rounded:"full",variant:"link",cursor:"pointer",minW:0,children:t.name}),Object(f.jsxs)(y.e,{name:"user-menu",children:["admin"===t.role?Object(f.jsx)(y.d,{children:"Settings"}):Object(f.jsx)(f.Fragment,{}),Object(f.jsx)(y.d,{children:"Profile"}),Object(f.jsx)(y.c,{}),Object(f.jsx)(y.d,{name:"user-logout",onClick:n,children:"Logout"})]})]})})},L=function(e){var t,r=e.loading,n=e.user,c=e.logout,a=Object(f.jsx)(p.a,{height:"20px"}),s=Object(f.jsx)(g.a,{sx:(t={position:"-webkit-sticky"},Object(v.a)(t,"position","sticky"),Object(v.a)(t,"top",0),Object(v.a)(t,"z-index",1),t),name:"app-header",bg:Object(k.c)("gray.100","gray.900"),px:4,children:Object(f.jsxs)(g.c,{h:16,alignItems:"center",justifyContent:"space-between",children:[Object(f.jsx)(g.e,{children:"TrailCam"}),Object(f.jsx)(g.j,{}),null!==n?Object(f.jsx)(D,{user:n,logout:c}):Object(f.jsx)(f.Fragment,{})]})});return r?a:s},S=r(50),F=r(8),C=r(58),I=r(83),R=r(92),T=r(27),U=function(e){var t=e.videoUrl,r=e.mediaType;return Object(f.jsx)("video",{controls:!0,children:Object(f.jsx)("source",{src:t,type:r})})},q=function(e){var t=e.recording,r=t.mediaType.split("/");return Object(f.jsx)(g.b,{children:Object(f.jsxs)(g.k,{textAlign:"center",align:"center",spacing:10,py:8,children:[Object(f.jsx)(g.c,{w:"full",children:"image"===r[0]?Object(f.jsx)(C.a,{src:t.mediaURL,alt:"Trail camera picture"}):Object(f.jsx)(U,{videoUrl:t.mediaURL,mediaType:t.mediaType})}),Object(f.jsxs)(g.k,{direction:{base:"column",md:"row"},children:[Object(f.jsx)(g.c,{flex:1,textAlign:"left",children:Object(f.jsx)(g.f,{spacing:3,children:Object.entries(t.emailBody).map((function(e){var t=Object(l.a)(e,2),r=t[0],n=t[1],c=T.b;return"temperature"===r?c=T.e:"date"===r?c=T.a:"time"===r&&(c=T.c),Object(f.jsxs)(g.h,{children:[Object(f.jsx)(g.g,{as:c,color:"green.500"}),Object(f.jsxs)("b",{children:[r,":"]})," ",n]},r)}))})}),Object(f.jsx)(g.c,{flex:1,children:Object(f.jsx)(g.n,{spacing:"10px",justify:"left",py:{base:4,md:0},children:t.tags.map((function(e){return Object(f.jsx)(g.o,{children:Object(f.jsxs)(I.a,{variant:"subtle",colorScheme:e.color,children:[Object(f.jsx)(I.d,{boxSize:"12px",as:T.d}),Object(f.jsx)(I.c,{children:e.tag}),Object(f.jsx)(I.b,{})]})},e._id)}))})})]})]})})},z=r(36),B=r.n(z),H="/api/recordings",E=function(){var e=Object(d.a)(u.a.mark((function e(){var t;return u.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.next=2,B.a.get(H);case 2:return t=e.sent,e.abrupt("return",t.data);case 4:case"end":return e.stop()}}),e)})));return function(){return e.apply(this,arguments)}}(),_=function(){var e=Object(d.a)(u.a.mark((function e(t){var r;return u.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.next=2,B.a.get("".concat(H,"/").concat(t));case 2:return r=e.sent,e.abrupt("return",r.data);case 4:case"end":return e.stop()}}),e)})));return function(t){return e.apply(this,arguments)}}(),M=function(){var e=Object(d.a)(u.a.mark((function e(t,r){var n;return u.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.next=2,B.a.get("".concat(H,"/").concat(t,"/").concat(r));case 2:return n=e.sent,e.abrupt("return",n.data);case 4:case"end":return e.stop()}}),e)})));return function(t,r){return e.apply(this,arguments)}}(),W={getRecordingsByPage:_,getInitialRecordings:E,getRecordingsByDate:M},A=function(e){var t=e.dayIndex,r=e.index,n=e.recording,c=Object(F.d)(),a=c.isOpen,s=c.onOpen,i=c.onClose,o=new Date(n.mediaDate).toLocaleDateString(),u=new Date(n.mediaDate).toLocaleTimeString();return Object(f.jsxs)(f.Fragment,{children:[Object(f.jsx)(g.a,{as:g.b,name:"recording-".concat(t,"-").concat(r),children:Object(f.jsxs)(g.a,{maxW:"445px",w:"full",bg:Object(k.c)("white","gray.900"),boxShadow:"2xl",rounded:"md",p:4,overflow:"hidden",children:[Object(f.jsx)(g.a,{as:"button",bg:"gray.100",mt:-6,mx:-6,mb:6,pos:"relative",onClick:s,children:Object(f.jsx)(C.a,{name:"thumbnail-".concat(t,"-").concat(r),src:n.mediaThumbnailURL,layout:"fill"})}),Object(f.jsxs)(g.f,{name:"info-".concat(t,"-").concat(r),spacing:3,children:[Object(f.jsxs)(g.h,{children:[Object(f.jsx)(g.g,{as:T.a,color:"green.500"}),Object(f.jsx)("b",{children:"Date"})," ",o]}),Object(f.jsxs)(g.h,{children:[Object(f.jsx)(g.g,{as:T.c,color:"green.500"}),Object(f.jsx)("b",{children:"Time:"})," ",u]})]}),Object(f.jsx)(g.n,{spacing:"10px",justify:"left",py:4,children:n.tags.map((function(e){return Object(f.jsx)(g.o,{children:Object(f.jsxs)(I.a,{variant:"subtle",colorScheme:e.color,children:[Object(f.jsx)(I.d,{boxSize:"12px",as:T.d}),Object(f.jsx)(I.c,{children:e.tag}),Object(f.jsx)(I.b,{})]})},e._id)}))})]})}),Object(f.jsxs)(R.a,{isOpen:a,size:"full",onClose:i,children:[Object(f.jsx)(R.e,{}),Object(f.jsxs)(R.d,{children:[Object(f.jsx)(R.c,{}),Object(f.jsx)(R.b,{children:Object(f.jsx)(q,{recording:n})})]})]})]})},J=function(e){var t=e.dayIndex,r=e.dayDate,n=e.dayRecordings;return Object(f.jsxs)(g.a,{name:"recordings-".concat(t),p:4,children:[Object(f.jsx)(g.e,{children:new Date(r).toLocaleDateString()}),Object(f.jsx)(g.i,{minChildWidth:"300px",spacing:"40px",py:4,children:n.map((function(e,r){return Object(f.jsx)(A,{dayIndex:t,index:r,recording:e},e._id)}))})]})},N=function(e){var t=e.errorHandler,r=Object(n.useState)({recordings:[],loading:!1,isLastPage:!1,isFirstPage:!0}),c=Object(l.a)(r,2),a=c[0],s=c[1],i=Object(n.useRef)(),o=Object(n.useRef)(),j=Object(n.useCallback)(function(){var e=Object(d.a)(u.a.mark((function e(r){var n;return u.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.prev=0,e.next=3,W.getRecordingsByDate(r.endpoint,r.requestedDate);case 3:n=e.sent,"before"===r.endpoint?0!==n.count?s((function(e){var t={recordings:[],loading:!1,isLastPage:!1,isFirstPage:e.isFirstPage},r=Object(S.a)(e.recordings);return r.length>=3?(t.isFirstPage=!1,t.recordings=r.slice(1).concat(n),t):(t.recordings=r.concat(n),t)})):s((function(e){return{recordings:e.recordings,loading:!1,isLastPage:!0,isFirstPage:e.isFirstPage}})):0!==n.count?s((function(e){var t={recordings:[],loading:!1,isLastPage:e.isLastPage,isFirstPage:!1},r=Object(S.a)(e.recordings);return r.length>=3?(t.isLastPage=!1,t.recordings=[n].concat(Object(S.a)(r.slice(0,-1))),t):(t.recordings=[n].concat(Object(S.a)(r)),t)})):s((function(e){return{recordings:e.recordings,loading:!1,isLastPage:e.isLastPage,isFirstPage:!0}})),e.next=11;break;case 7:e.prev=7,e.t0=e.catch(0),"before"===r.endpoint?s((function(e){return{recordings:e.recordings,loading:!1,isLastPage:!0,isFirstPage:e.isFirstPage}})):s((function(e){return{recordings:e.recordings,loading:!1,isLastPage:e.isLastPage,isFirstPage:!0}})),t(e.t0);case 11:case"end":return e.stop()}}),e,null,[[0,7]])})));return function(t){return e.apply(this,arguments)}}(),[t]),b=Object(n.useCallback)((function(e){a.loading||(i.current&&i.current.disconnect(),i.current=new IntersectionObserver(function(){var e=Object(d.a)(u.a.mark((function e(t){var r;return u.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:if(!t[0].isIntersecting||a.isLastPage){e.next=5;break}return r={endpoint:"before",requestedDate:(new Date).toISOString()},a.recordings.length>0&&(r.requestedDate=a.recordings[a.recordings.length-1].recordings[a.recordings[a.recordings.length-1].recordings.length-1].mediaDate),e.next=5,j(r);case 5:case"end":return e.stop()}}),e)})));return function(t){return e.apply(this,arguments)}}(),{rootMargin:"0px 0px 900px 0px"}),e&&i.current.observe(e))}),[a,j]),g=Object(n.useCallback)((function(e){a.loading||(o.current&&o.current.disconnect(),o.current=new IntersectionObserver(function(){var e=Object(d.a)(u.a.mark((function e(t){var r;return u.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:if(!t[0].isIntersecting||a.isFirstPage){e.next=5;break}return r={endpoint:"after",requestedDate:(new Date).toISOString()},a.recordings.length>0&&(r.requestedDate=a.recordings[0].recordings[0].mediaDate),e.next=5,j(r);case 5:case"end":return e.stop()}}),e)})));return function(t){return e.apply(this,arguments)}}(),{rootMargin:"900px 0px 0px 0px"}),e&&o.current.observe(e))}),[a,j]);return Object(f.jsxs)(f.Fragment,{children:[Object(f.jsx)("div",{ref:g}),function(){for(var e=[],t=[],r=0,n=0;n<a.recordings.length;n++)t=t.concat(a.recordings[n].recordings),0===r&&(r=a.recordings[n]._id),n+1<a.recordings.length?a.recordings[n+1].date!==a.recordings[n].date&&(e.push(Object(f.jsx)(J,{dayIndex:n,dayDate:a.recordings[n].date,dayRecordings:t},r)),r=0,t=[]):e.push(Object(f.jsx)(J,{dayIndex:n,dayDate:a.recordings[n].date,dayRecordings:t},r));return e}(),Object(f.jsx)(p.a,{isLoaded:!a.loading,height:"20px",children:Object(f.jsx)("div",{ref:b,children:0===a.recordings.length&&!0===a.isLastPage&&"No results"})})]})},G=function(e){var t=e.message;return null===t||0===t.length?null:Object(f.jsx)("div",{name:"notification",children:t})},K="/api/auth",Q=function(){var e=Object(d.a)(u.a.mark((function e(t){var r;return u.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.next=2,B.a.post("".concat(K,"/login"),t);case 2:return r=e.sent,e.abrupt("return",r.data);case 4:case"end":return e.stop()}}),e)})));return function(t){return e.apply(this,arguments)}}(),V=function(){var e=Object(d.a)(u.a.mark((function e(){var t;return u.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.next=2,B.a.post("".concat(K,"/logout"));case 2:return t=e.sent,e.abrupt("return",t.data);case 4:case"end":return e.stop()}}),e)})));return function(){return e.apply(this,arguments)}}(),X=function(){var e=Object(d.a)(u.a.mark((function e(){var t;return u.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.next=2,B.a.get(K);case 2:return t=e.sent,e.abrupt("return",t.data);case 4:case"end":return e.stop()}}),e)})));return function(){return e.apply(this,arguments)}}(),Y={login:Q,logout:V,auth:X},Z=function(e){var t=e.user,r=e.loginUser,n=e.errorHandler;return Object(f.jsxs)(j.d,{children:[Object(f.jsx)(j.b,{path:"/login",children:null===t?Object(f.jsx)(m,{loginUser:r}):Object(f.jsx)(j.a,{to:"/dashboard"})}),Object(f.jsx)(j.b,{path:"/dashboard",children:null===t?Object(f.jsx)(j.a,{to:"/login"}):Object(f.jsx)(N,{errorHandler:n})}),Object(f.jsx)(j.b,{children:null===t?Object(f.jsx)(j.a,{to:"/login"}):Object(f.jsx)(j.a,{to:"/dashboard"})})]})},$=function(){var e=Object(n.useState)(null),t=Object(l.a)(e,2),r=t[0],c=t[1],a=Object(n.useState)(!0),s=Object(l.a)(a,2),i=s[0],o=s[1],j=Object(n.useState)(""),g=Object(l.a)(j,2),x=g[0],O=g[1],h=Object(n.useCallback)((function(e){e.response?401===e.response.status?(console.log(e.response.data.error),c(null)):e.response.data.error?console.log(e.response.data.error):console.log(e.response.data):console.log(e)}),[]);Object(n.useEffect)((function(){var e=function(){var e=Object(d.a)(u.a.mark((function e(){var t;return u.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.prev=0,e.next=3,Y.auth();case 3:t=e.sent,c(t),e.next=10;break;case 7:e.prev=7,e.t0=e.catch(0),h(e.t0);case 10:return e.prev=10,o(!1),e.finish(10);case 13:case"end":return e.stop()}}),e,null,[[0,7,10,13]])})));return function(){return e.apply(this,arguments)}}();e()}),[h]);var m=function(){var e=Object(d.a)(u.a.mark((function e(t){var r;return u.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return o(!0),e.prev=1,e.next=4,Y.login(t);case 4:r=e.sent,c(r),O(""),e.next=12;break;case 9:e.prev=9,e.t0=e.catch(1),e.t0.response.data.error?O(e.t0.response.data.error):O(e.t0.response.data);case 12:return e.prev=12,o(!1),e.finish(12);case 15:case"end":return e.stop()}}),e,null,[[1,9,12,15]])})));return function(t){return e.apply(this,arguments)}}(),v=function(){var e=Object(d.a)(u.a.mark((function e(){return u.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.prev=0,e.next=3,Y.logout();case 3:c(null),O("Logout successful"),e.next=10;break;case 7:e.prev=7,e.t0=e.catch(0),e.t0.response.data.error?O(e.t0.response.data.error):O(e.t0.response.data);case 10:case"end":return e.stop()}}),e,null,[[0,7]])})));return function(){return e.apply(this,arguments)}}();return Object(f.jsxs)(b.a,{children:[Object(f.jsx)(L,{loading:i,user:r,logout:v}),Object(f.jsx)(G,{message:x}),i?Object(f.jsx)(p.a,{height:"50px"}):Object(f.jsx)(Z,{user:r,loginUser:m,errorHandler:h})]})};s.a.render(Object(f.jsx)(i.a,{children:Object(f.jsx)(c.a.StrictMode,{children:Object(f.jsx)($,{})})}),document.getElementById("root"))}},[[153,1,2]]]);
//# sourceMappingURL=main.b2b07338.chunk.js.map