(this.webpackJsonptrailcam=this.webpackJsonptrailcam||[]).push([[0],{133:function(e,t,n){"use strict";n.r(t);var r=n(0),c=n.n(r),a=n(37),s=n.n(a),i=n(26),o=n(7),u=n.n(o),j=n(10),l=n(16),d=n(9),b=n(27),p=n(64),x=n(57),O=n(41),h=n(61),f=n(62),g=n(3),m=function(e){var t=e.loginUser,n=Object(r.useState)(!1),c=Object(l.a)(n,2),a=c[0],s=c[1],i=function(){var e=Object(j.a)(u.a.mark((function e(n){var r,c,a,s;return u.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return n.preventDefault(),r=n.target.elements,c=r.email,a=r.password,s={email:c.value,password:a.value},c.value="",a.value="",e.next=7,t(s);case 7:case"end":return e.stop()}}),e)})));return function(t){return e.apply(this,arguments)}}();return Object(g.jsx)(x.q,{children:Object(g.jsxs)("form",{name:"login-form",onSubmit:i,children:[Object(g.jsxs)(O.a,{id:"email",children:[Object(g.jsx)(O.b,{children:"Email"}),Object(g.jsx)(h.a,{variant:"outline",name:"email",type:"text",placeholder:"Email"})]}),Object(g.jsxs)(O.a,{id:"password",children:[Object(g.jsx)(O.b,{children:"Password"}),Object(g.jsxs)(h.b,{children:[Object(g.jsx)(h.a,{variant:"outline",name:"password",type:a?"text":"password",placeholder:"Password"}),Object(g.jsx)(h.c,{children:Object(g.jsx)(f.a,{onClick:function(){s(!a)},children:a?"Hide":"Show"})})]})]}),Object(g.jsx)(f.a,{variant:"solid",name:"login-button",type:"submit",children:"Login"})]})})},v=n(29),y=n(63),w=n(74),k=n(35),S=c.a.forwardRef((function(e,t){return Object(g.jsxs)(x.e,{as:"button",name:e.name,onClick:e.onClick,ref:t,children:[Object(g.jsx)(y.a,{name:e.children.props.children,size:"sm",src:""}),Object(g.jsx)(x.p,{children:e.children.props.children})]})})),I=function(e){var t=e.user,n=e.logout,r=function(){var e=Object(j.a)(u.a.mark((function e(){return u.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.next=2,n();case 2:case"end":return e.stop()}}),e)})));return function(){return e.apply(this,arguments)}}();return Object(g.jsx)(x.d,{alignItems:"center",justifyContent:"space-between",children:Object(g.jsxs)(w.a,{children:[Object(g.jsx)(w.b,{name:"user-avatar",as:S,rounded:"full",variant:"link",cursor:"pointer",minW:0,children:t.name}),Object(g.jsxs)(w.e,{name:"user-menu",children:["admin"===t.role?Object(g.jsx)(w.d,{children:"Settings"}):Object(g.jsx)(g.Fragment,{}),Object(g.jsx)(w.d,{children:"Profile"}),Object(g.jsx)(w.c,{}),Object(g.jsx)(w.d,{name:"user-logout",onClick:r,children:"Logout"})]})]})})},C=function(e){var t,n=e.loading,r=e.user,c=e.logout,a=Object(g.jsx)(p.a,{height:"20px"}),s=Object(g.jsx)(x.a,{sx:(t={position:"-webkit-sticky"},Object(v.a)(t,"position","sticky"),Object(v.a)(t,"top",0),Object(v.a)(t,"z-index",1),t),name:"app-header",bg:Object(k.c)("gray.100","gray.900"),px:4,children:Object(g.jsxs)(x.d,{h:16,alignItems:"center",justifyContent:"space-between",children:[Object(g.jsx)(x.f,{children:Object(g.jsx)(x.g,{_hover:{textDecoration:"none"},href:"#top",children:"TrailCam"})}),Object(g.jsx)(x.n,{}),null!==r?Object(g.jsx)(I,{user:r,logout:c}):Object(g.jsx)(g.Fragment,{})]})});return n?a:s},D=n(56),L=n(44),R=n(73),T=n(21),U=n(30),_=n.n(U),E="/api/recordings",H=function(){var e=Object(j.a)(u.a.mark((function e(){var t;return u.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.next=2,_.a.get(E);case 2:return t=e.sent,e.abrupt("return",t.data);case 4:case"end":return e.stop()}}),e)})));return function(){return e.apply(this,arguments)}}(),P=function(){var e=Object(j.a)(u.a.mark((function e(t){var n;return u.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.next=2,_.a.get("".concat(E,"/").concat(t));case 2:return n=e.sent,e.abrupt("return",n.data);case 4:case"end":return e.stop()}}),e)})));return function(t){return e.apply(this,arguments)}}(),z={getRecordingsByPage:P,getInitialRecordings:H},B=function(e){var t=e.dayIndex,n=e.index,r=e.recording;return Object(g.jsx)(x.h,{as:x.b,name:"recording-".concat(t,"-").concat(n),children:Object(g.jsxs)(x.a,{maxW:"445px",w:"full",bg:Object(k.c)("white","gray.900"),boxShadow:"2xl",rounded:"md",p:4,overflow:"hidden",children:[Object(g.jsx)(x.a,{bg:"gray.100",mt:-6,mx:-6,mb:6,pos:"relative",children:Object(g.jsx)(L.a,{name:"thumbnail-".concat(t,"-").concat(n),src:r.mediaThumbnailURL,layout:"fill"})}),Object(g.jsxs)(x.j,{name:"info-".concat(t,"-").concat(n),spacing:3,children:[Object(g.jsxs)(x.l,{children:[Object(g.jsx)(x.k,{as:T.b,color:"green.500"}),Object(g.jsxs)(x.i,{as:b.b,to:{pathname:"/dashboard/".concat(r._id),state:{recording:r}},children:[Object(g.jsx)("b",{children:"Date"})," ",new Date(r.mediaDate).toLocaleDateString()]})]}),Object(g.jsxs)(x.l,{children:[Object(g.jsx)(x.k,{as:T.d,color:"green.500"}),Object(g.jsx)("b",{children:"Time:"})," ",new Date(r.mediaDate).toLocaleTimeString()]})]}),Object(g.jsx)(x.r,{spacing:"10px",justify:"left",py:4,children:r.tags.map((function(e){return Object(g.jsx)(x.s,{children:Object(g.jsxs)(R.a,{variant:"subtle",colorScheme:e.color,children:[Object(g.jsx)(R.d,{boxSize:"12px",as:T.e}),Object(g.jsx)(R.c,{children:e.tag}),Object(g.jsx)(R.b,{})]})},e._id)}))})]})})},W=function(e){var t=e.dayIndex,n=e.dayRecordings;return Object(g.jsxs)(x.a,{name:"recordings-".concat(t),p:4,children:[Object(g.jsx)(x.f,{children:new Date(n.date).toLocaleDateString()}),Object(g.jsx)(x.m,{minChildWidth:"300px",spacing:"40px",py:4,children:n.recordings.map((function(e,n){return Object(g.jsx)(B,{dayIndex:t,index:n,recording:e},e._id)}))})]})},F=function(e){var t=e.errorHandler,n=Object(r.useState)([]),c=Object(l.a)(n,2),a=c[0],s=c[1],i=Object(r.useState)(!1),o=Object(l.a)(i,2),d=o[0],b=o[1],x=Object(r.useState)(1),O=Object(l.a)(x,2),h=O[0],f=O[1],m=Object(r.useState)(!0),v=Object(l.a)(m,2),y=v[0],w=v[1],k=Object(r.useRef)(),S=Object(r.useCallback)((function(e){d||(k.current&&k.current.disconnect(),k.current=new IntersectionObserver((function(e){e[0].isIntersecting&&!y&&f((function(e){return e+1}))})),e&&k.current.observe(e))}),[d,y]);return Object(r.useEffect)((function(){var e=function(){var e=Object(j.a)(u.a.mark((function e(){var n;return u.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.prev=0,e.next=3,z.getRecordingsByPage(h);case 3:0!==(n=e.sent).count?(s((function(e){var t=e.length;if(0===t)return[n];if(e[t-1].date===n.date){var r={_id:e[t-1]._id,count:e[t-1].count+n.count,date:n.date,recordings:e[t-1].recordings.concat(n.recordings)};return[].concat(Object(D.a)(e.slice(0,-1)),[r])}return[].concat(Object(D.a)(e),[n])})),w(!1)):w(!0),b(!1),e.next=13;break;case 8:e.prev=8,e.t0=e.catch(0),w(!0),b(!1),t(e.t0);case 13:case"end":return e.stop()}}),e,null,[[0,8]])})));return function(){return e.apply(this,arguments)}}();b(!0),e()}),[h,t]),Object(g.jsxs)(g.Fragment,{children:[a.map((function(e,t){return Object(g.jsx)(W,{dayIndex:t,dayRecordings:e},e._id)})),Object(g.jsx)(p.a,{isLoaded:!d,height:"20px",children:Object(g.jsx)("div",{ref:S,children:1===h&&!0===y&&"No results"})})]})},A=function(e){var t=e.videoUrl,n=e.mediaType;return Object(g.jsx)("video",{controls:!0,children:Object(g.jsx)("source",{src:t,type:n})})},J=function(e){var t,n=Object(d.g)().state.recording,r=n.mediaType.split("/");return console.log("mediatype: ",n.mediaType,"mediatypesplit: ",r),Object(g.jsxs)(x.c,{maxW:"5xl",children:[Object(g.jsx)(x.g,{as:b.b,to:"/dashboard",children:Object(g.jsx)(f.b,{"aria-label":"Go back",icon:Object(g.jsx)(T.a,{}),sx:(t={position:"-webkit-sticky"},Object(v.a)(t,"position","sticky"),Object(v.a)(t,"top","80px"),t)})}),Object(g.jsxs)(x.o,{textAlign:"center",align:"center",spacing:10,py:8,children:[Object(g.jsx)(x.d,{w:"full",children:"image"===r[0]?Object(g.jsx)(L.a,{src:n.mediaURL,alt:"Trail camera picture"}):Object(g.jsx)(A,{videoUrl:n.mediaURL,mediaType:n.mediaType})}),Object(g.jsxs)(x.o,{direction:{base:"column",md:"row"},children:[Object(g.jsx)(x.d,{flex:1,textAlign:"left",children:Object(g.jsx)(x.j,{spacing:3,children:Object.entries(n.emailBody).map((function(e){var t=Object(l.a)(e,2),n=t[0],r=t[1],c=T.c;return"temperature"===n?c=T.f:"date"===n?c=T.b:"time"===n&&(c=T.d),Object(g.jsxs)(x.l,{children:[Object(g.jsx)(x.k,{as:c,color:"green.500"}),Object(g.jsxs)("b",{children:[n,":"]})," ",r]},n)}))})}),Object(g.jsx)(x.d,{flex:1,children:Object(g.jsx)(x.r,{spacing:"10px",justify:"left",py:{base:4,md:0},children:n.tags.map((function(e){return Object(g.jsx)(x.s,{children:Object(g.jsxs)(R.a,{variant:"subtle",colorScheme:e.color,children:[Object(g.jsx)(R.d,{boxSize:"12px",as:T.e}),Object(g.jsx)(R.c,{children:e.tag}),Object(g.jsx)(R.b,{})]})},e._id)}))})})]})]})]})},q=function(e){var t=e.message;return null===t||0===t.length?null:Object(g.jsx)("div",{name:"notification",children:t})},G="/api/auth",M=function(){var e=Object(j.a)(u.a.mark((function e(t){var n;return u.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.next=2,_.a.post("".concat(G,"/login"),t);case 2:return n=e.sent,e.abrupt("return",n.data);case 4:case"end":return e.stop()}}),e)})));return function(t){return e.apply(this,arguments)}}(),N=function(){var e=Object(j.a)(u.a.mark((function e(){var t;return u.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.next=2,_.a.post("".concat(G,"/logout"));case 2:return t=e.sent,e.abrupt("return",t.data);case 4:case"end":return e.stop()}}),e)})));return function(){return e.apply(this,arguments)}}(),K=function(){var e=Object(j.a)(u.a.mark((function e(){var t;return u.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.next=2,_.a.get(G);case 2:return t=e.sent,e.abrupt("return",t.data);case 4:case"end":return e.stop()}}),e)})));return function(){return e.apply(this,arguments)}}(),Q={login:M,logout:N,auth:K},V=function(e){var t=e.user,n=e.loginUser,r=e.errorHandler;return Object(g.jsxs)(d.d,{children:[Object(g.jsx)(d.b,{path:"/login",children:null===t?Object(g.jsx)(m,{loginUser:n}):Object(g.jsx)(d.a,{to:"/dashboard"})}),Object(g.jsx)(d.b,{path:"/dashboard/:recordingId",children:null===t?Object(g.jsx)(d.a,{to:"/login"}):Object(g.jsx)(J,{})}),Object(g.jsx)(d.b,{path:"/dashboard",children:null===t?Object(g.jsx)(d.a,{to:"/login"}):Object(g.jsx)(F,{errorHandler:r})}),Object(g.jsx)(d.b,{children:null===t?Object(g.jsx)(d.a,{to:"/login"}):Object(g.jsx)(d.a,{to:"/dashboard"})})]})},X=function(){var e=Object(r.useState)(null),t=Object(l.a)(e,2),n=t[0],c=t[1],a=Object(r.useState)(!0),s=Object(l.a)(a,2),i=s[0],o=s[1],d=Object(r.useState)(""),x=Object(l.a)(d,2),O=x[0],h=x[1],f=Object(r.useCallback)((function(e){e.response?401===e.response.status?(console.log(e.response.data.error),c(null)):e.response.data.error?console.log(e.response.data.error):console.log(e.response.data):console.log(e)}),[]);Object(r.useEffect)((function(){var e=function(){var e=Object(j.a)(u.a.mark((function e(){var t;return u.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.prev=0,e.next=3,Q.auth();case 3:t=e.sent,c(t),e.next=10;break;case 7:e.prev=7,e.t0=e.catch(0),f(e.t0);case 10:return e.prev=10,o(!1),e.finish(10);case 13:case"end":return e.stop()}}),e,null,[[0,7,10,13]])})));return function(){return e.apply(this,arguments)}}();e()}),[f]);var m=function(){var e=Object(j.a)(u.a.mark((function e(t){var n;return u.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return o(!0),e.prev=1,e.next=4,Q.login(t);case 4:n=e.sent,c(n),h(""),e.next=12;break;case 9:e.prev=9,e.t0=e.catch(1),e.t0.response.data.error?h(e.t0.response.data.error):h(e.t0.response.data);case 12:return e.prev=12,o(!1),e.finish(12);case 15:case"end":return e.stop()}}),e,null,[[1,9,12,15]])})));return function(t){return e.apply(this,arguments)}}(),v=function(){var e=Object(j.a)(u.a.mark((function e(){return u.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.prev=0,e.next=3,Q.logout();case 3:c(null),h("Logout successful"),e.next=10;break;case 7:e.prev=7,e.t0=e.catch(0),e.t0.response.data.error?h(e.t0.response.data.error):h(e.t0.response.data);case 10:case"end":return e.stop()}}),e,null,[[0,7]])})));return function(){return e.apply(this,arguments)}}();return Object(g.jsxs)(b.a,{children:[Object(g.jsx)(C,{loading:i,user:n,logout:v}),Object(g.jsx)(q,{message:O}),i?Object(g.jsx)(p.a,{height:"50px"}):Object(g.jsx)(V,{user:n,loginUser:m,errorHandler:f})]})};s.a.render(Object(g.jsx)(i.a,{children:Object(g.jsx)(c.a.StrictMode,{children:Object(g.jsx)(X,{})})}),document.getElementById("root"))}},[[133,1,2]]]);
//# sourceMappingURL=main.a51539af.chunk.js.map