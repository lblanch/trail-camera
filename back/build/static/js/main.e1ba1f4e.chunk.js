(this.webpackJsonptrailcam=this.webpackJsonptrailcam||[]).push([[0],{142:function(e,t,n){"use strict";n.r(t);var r=n(0),a=n.n(r),c=n(98),s=n.n(c),i=n(181),o=n(10),u=n.n(o),j=n(18),l=n(4),b=n(15),d=n(42),x=n(180),p=n(183),O=n(53),h=n(161),f=n(184),g=n(162),m=n(163),v=n(105),w=n(2),y=function(e){var t=e.loginUser,n=Object(r.useState)(!1),a=Object(l.a)(n,2),c=a[0],s=a[1],i=function(){var e=Object(j.a)(u.a.mark((function e(n){var r,a,c,s;return u.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return n.preventDefault(),r=n.target.elements,a=r.email,c=r.password,s={email:a.value,password:c.value},a.value="",c.value="",e.next=7,t(s);case 7:case"end":return e.stop()}}),e)})));return function(t){return e.apply(this,arguments)}}();return Object(w.jsx)(p.c,{children:Object(w.jsxs)("form",{name:"login-form",onSubmit:i,children:[Object(w.jsxs)(O.a,{id:"email",children:[Object(w.jsx)(h.a,{children:"Email"}),Object(w.jsx)(f.a,{variant:"outline",name:"email",type:"text",placeholder:"Email"})]}),Object(w.jsxs)(O.a,{id:"password",children:[Object(w.jsx)(h.a,{children:"Password"}),Object(w.jsxs)(g.a,{children:[Object(w.jsx)(f.a,{variant:"outline",name:"password",type:c?"text":"password",placeholder:"Password"}),Object(w.jsx)(m.a,{children:Object(w.jsx)(v.a,{onClick:function(){s(!c)},children:c?"Hide":"Show"})})]})]}),Object(w.jsx)(v.a,{variant:"solid",name:"login-button",type:"submit",children:"Login"})]})})},k=n(3),S=n(164),I=n(165),D=n(166),C=n(179),L=n(167),R=n(107),_=n(168),U=n(169),E=n(170),P=a.a.forwardRef((function(e,t){return Object(w.jsxs)(p.a,{as:"button",name:e.name,onClick:e.onClick,ref:t,children:[Object(w.jsx)(S.a,{name:e.children.props.children,size:"sm",src:""}),Object(w.jsx)(I.a,{children:e.children.props.children})]})})),T=function(e){var t=e.user,n=e.logout,r=function(){var e=Object(j.a)(u.a.mark((function e(){return u.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.next=2,n();case 2:case"end":return e.stop()}}),e)})));return function(){return e.apply(this,arguments)}}();return Object(w.jsx)(D.a,{alignItems:"center",justifyContent:"space-between",children:Object(w.jsxs)(C.a,{children:[Object(w.jsx)(C.b,{name:"user-avatar",as:P,rounded:"full",variant:"link",cursor:"pointer",minW:0,children:t.name}),Object(w.jsxs)(C.e,{name:"user-menu",children:["admin"===t.role?Object(w.jsx)(C.d,{children:"Settings"}):Object(w.jsx)(w.Fragment,{}),Object(w.jsx)(C.d,{children:"Profile"}),Object(w.jsx)(C.c,{}),Object(w.jsx)(C.d,{name:"user-logout",onClick:r,children:"Logout"})]})]})})},z=function(e){var t,n=e.loading,r=e.user,a=e.logout,c=Object(w.jsx)(x.a,{height:"20px"}),s=Object(w.jsx)(L.a,{sx:(t={position:"-webkit-sticky"},Object(k.a)(t,"position","sticky"),Object(k.a)(t,"top",0),Object(k.a)(t,"z-index",1),t),name:"app-header",bg:Object(R.c)("gray.100","gray.900"),px:4,children:Object(w.jsxs)(D.a,{h:16,alignItems:"center",justifyContent:"space-between",children:[Object(w.jsx)(_.a,{children:Object(w.jsx)(U.a,{_hover:{textDecoration:"none"},href:"#top",children:"TrailCam"})}),Object(w.jsx)(E.a,{}),null!==r?Object(w.jsx)(T,{user:r,logout:a}):Object(w.jsx)(w.Fragment,{})]})});return n?c:s},B=n(16),W=n(171),F=n(172),A=n(173),J=n(174),G=n(175),H=n(176),M=n(185),N=n(33),q=n(44),K=n.n(q),Q="/api/recordings",V=function(){var e=Object(j.a)(u.a.mark((function e(){var t;return u.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.next=2,K.a.get(Q);case 2:return t=e.sent,e.abrupt("return",t.data);case 4:case"end":return e.stop()}}),e)})));return function(){return e.apply(this,arguments)}}(),X=function(){var e=Object(j.a)(u.a.mark((function e(t){var n;return u.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.next=2,K.a.get("".concat(Q,"/").concat(t));case 2:return n=e.sent,e.abrupt("return",n.data);case 4:case"end":return e.stop()}}),e)})));return function(t){return e.apply(this,arguments)}}(),Y={getRecordingsByPage:X,getInitialRecordings:V},Z=function(e){var t=e.dayIndex,n=e.index,r=e.recording;return Object(w.jsx)(W.a,{as:F.a,name:"recording-".concat(t,"-").concat(n),children:Object(w.jsxs)(L.a,{maxW:"445px",w:"full",bg:Object(R.c)("white","gray.900"),boxShadow:"2xl",rounded:"md",p:4,overflow:"hidden",children:[Object(w.jsx)(L.a,{bg:"gray.100",mt:-6,mx:-6,mb:6,pos:"relative",children:Object(w.jsx)(A.a,{name:"thumbnail-".concat(t,"-").concat(n),src:r.mediaThumbnailURL,layout:"fill"})}),Object(w.jsxs)(J.a,{name:"info-".concat(t,"-").concat(n),spacing:3,children:[Object(w.jsxs)(J.c,{children:[Object(w.jsx)(J.b,{as:N.b,color:"green.500"}),Object(w.jsxs)(W.b,{as:d.b,to:{pathname:"/dashboard/".concat(r._id),state:{recording:r}},children:[Object(w.jsx)("b",{children:"Date"})," ",new Date(r.mediaDate).toLocaleDateString()]})]}),Object(w.jsxs)(J.c,{children:[Object(w.jsx)(J.b,{as:N.d,color:"green.500"}),Object(w.jsx)("b",{children:"Time:"})," ",new Date(r.mediaDate).toLocaleTimeString()]})]}),Object(w.jsx)(G.a,{spacing:"10px",justify:"left",py:4,children:r.tags.map((function(e){return Object(w.jsx)(G.b,{children:Object(w.jsxs)(H.a,{variant:"subtle",colorScheme:e.color,children:[Object(w.jsx)(H.d,{boxSize:"12px",as:N.e}),Object(w.jsx)(H.c,{children:e.tag}),Object(w.jsx)(H.b,{})]})},e._id)}))})]})})},$=function(e){var t=e.dayIndex,n=e.dayRecordings;return Object(w.jsxs)(L.a,{name:"recordings-".concat(t),p:4,children:[Object(w.jsx)(_.a,{children:new Date(n.date).toLocaleDateString()}),Object(w.jsx)(M.a,{minChildWidth:"300px",spacing:"40px",py:4,children:n.recordings.map((function(e,n){return Object(w.jsx)(Z,{dayIndex:t,index:n,recording:e},e._id)}))})]})},ee=function(){var e=Object(r.useState)([]),t=Object(l.a)(e,2),n=t[0],a=t[1],c=Object(r.useState)(!1),s=Object(l.a)(c,2),i=s[0],o=s[1],b=Object(r.useState)(1),d=Object(l.a)(b,2),p=d[0],O=d[1],h=Object(r.useState)(!0),f=Object(l.a)(h,2),g=f[0],m=f[1],v=Object(r.useRef)(),y=Object(r.useCallback)((function(e){i||(v.current&&v.current.disconnect(),v.current=new IntersectionObserver((function(e){e[0].isIntersecting&&!g&&O((function(e){return e+1}))})),e&&v.current.observe(e))}),[i,g]);return Object(r.useEffect)((function(){var e=function(){var e=Object(j.a)(u.a.mark((function e(){var t;return u.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.prev=0,e.next=3,Y.getRecordingsByPage(p);case 3:0!==(t=e.sent).count?(a((function(e){var n=e.length;if(0===n)return[t];if(e[n-1].date===t.date){var r={_id:e[n-1]._id,count:e[n-1].count+t.count,date:t.date,recordings:e[n-1].recordings.concat(t.recordings)};return[].concat(Object(B.a)(e.slice(0,-1)),[r])}return[].concat(Object(B.a)(e),[t])})),m(!1)):m(!0),e.next=10;break;case 7:e.prev=7,e.t0=e.catch(0),e.t0.response?e.t0.response.data.error?console.log(e.t0.response.data.error):console.log(e.t0.response.data):console.log(e.t0);case 10:return e.prev=10,o(!1),e.finish(10);case 13:case"end":return e.stop()}}),e,null,[[0,7,10,13]])})));return function(){return e.apply(this,arguments)}}();o(!0),e()}),[p]),Object(w.jsxs)(w.Fragment,{children:[n.map((function(e,t){return Object(w.jsx)($,{dayIndex:t,dayRecordings:e},e._id)})),Object(w.jsx)(x.a,{isLoaded:!i,height:"20px",children:Object(w.jsx)("div",{ref:y,children:1===p&&!0===g&&"No results"})})]})},te=n(177),ne=n(178),re=function(e){var t,n=Object(b.g)().state.recording;return Object(w.jsxs)(te.a,{maxW:"5xl",children:[Object(w.jsx)(U.a,{as:d.b,to:"/dashboard",children:Object(w.jsx)(ne.a,{"aria-label":"Go back",icon:Object(w.jsx)(N.a,{}),sx:(t={position:"-webkit-sticky"},Object(k.a)(t,"position","sticky"),Object(k.a)(t,"top","80px"),t)})}),Object(w.jsxs)(p.b,{textAlign:"center",align:"center",spacing:10,py:8,children:[Object(w.jsx)(D.a,{w:"full",children:Object(w.jsx)(A.a,{src:n.mediaURL,alt:"Trail camera picture"})}),Object(w.jsxs)(p.b,{direction:{base:"column",md:"row"},children:[Object(w.jsx)(D.a,{flex:1,textAlign:"left",children:Object(w.jsx)(J.a,{spacing:3,children:Object.entries(n.emailBody).map((function(e){var t=Object(l.a)(e,2),n=t[0],r=t[1],a=N.c;return"temperature"===n?a=N.f:"date"===n?a=N.b:"time"===n&&(a=N.d),Object(w.jsxs)(J.c,{children:[Object(w.jsx)(J.b,{as:a,color:"green.500"}),Object(w.jsxs)("b",{children:[n,":"]})," ",r]},n)}))})}),Object(w.jsx)(D.a,{flex:1,children:Object(w.jsx)(G.a,{spacing:"10px",justify:"left",py:{base:4,md:0},children:n.tags.map((function(e){return Object(w.jsx)(G.b,{children:Object(w.jsxs)(H.a,{variant:"subtle",colorScheme:e.color,children:[Object(w.jsx)(H.d,{boxSize:"12px",as:N.e}),Object(w.jsx)(H.c,{children:e.tag}),Object(w.jsx)(H.b,{})]})},e._id)}))})})]})]})]})},ae=function(e){var t=e.message;return null===t||0===t.length?null:Object(w.jsx)("div",{name:"notification",children:t})},ce="/api/auth",se=function(){var e=Object(j.a)(u.a.mark((function e(t){var n;return u.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.next=2,K.a.post("".concat(ce,"/login"),t);case 2:return n=e.sent,e.abrupt("return",n.data);case 4:case"end":return e.stop()}}),e)})));return function(t){return e.apply(this,arguments)}}(),ie=function(){var e=Object(j.a)(u.a.mark((function e(){var t;return u.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.next=2,K.a.post("".concat(ce,"/logout"));case 2:return t=e.sent,e.abrupt("return",t.data);case 4:case"end":return e.stop()}}),e)})));return function(){return e.apply(this,arguments)}}(),oe=function(){var e=Object(j.a)(u.a.mark((function e(){var t;return u.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.next=2,K.a.get(ce);case 2:return t=e.sent,e.abrupt("return",t.data);case 4:case"end":return e.stop()}}),e)})));return function(){return e.apply(this,arguments)}}(),ue={login:se,logout:ie,auth:oe},je=function(e){var t=e.user,n=e.loginUser;return Object(w.jsxs)(b.d,{children:[Object(w.jsx)(b.b,{path:"/login",children:null===t?Object(w.jsx)(y,{loginUser:n}):Object(w.jsx)(b.a,{to:"/dashboard"})}),Object(w.jsx)(b.b,{path:"/dashboard/:recordingId",children:null===t?Object(w.jsx)(b.a,{to:"/login"}):Object(w.jsx)(re,{})}),Object(w.jsx)(b.b,{path:"/dashboard",children:null===t?Object(w.jsx)(b.a,{to:"/login"}):Object(w.jsx)(ee,{})}),Object(w.jsx)(b.b,{children:null===t?Object(w.jsx)(b.a,{to:"/login"}):Object(w.jsx)(b.a,{to:"/dashboard"})})]})},le=function(){var e=Object(r.useState)(null),t=Object(l.a)(e,2),n=t[0],a=t[1],c=Object(r.useState)(!0),s=Object(l.a)(c,2),i=s[0],o=s[1],b=Object(r.useState)(""),p=Object(l.a)(b,2),O=p[0],h=p[1];Object(r.useEffect)((function(){var e=function(){var e=Object(j.a)(u.a.mark((function e(){var t;return u.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.prev=0,e.next=3,ue.auth();case 3:t=e.sent,a(t),e.next=10;break;case 7:e.prev=7,e.t0=e.catch(0),e.t0.response?e.t0.response.data.error?console.log(e.t0.response.data.error):console.log(e.t0.response.data):console.log(e.t0);case 10:return e.prev=10,o(!1),e.finish(10);case 13:case"end":return e.stop()}}),e,null,[[0,7,10,13]])})));return function(){return e.apply(this,arguments)}}();e()}),[]);var f=function(){var e=Object(j.a)(u.a.mark((function e(t){var n;return u.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return o(!0),e.prev=1,e.next=4,ue.login(t);case 4:n=e.sent,a(n),h(""),e.next=12;break;case 9:e.prev=9,e.t0=e.catch(1),e.t0.response.data.error?h(e.t0.response.data.error):h(e.t0.response.data);case 12:return e.prev=12,o(!1),e.finish(12);case 15:case"end":return e.stop()}}),e,null,[[1,9,12,15]])})));return function(t){return e.apply(this,arguments)}}(),g=function(){var e=Object(j.a)(u.a.mark((function e(){return u.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.prev=0,e.next=3,ue.logout();case 3:a(null),h("Logout successful"),e.next=10;break;case 7:e.prev=7,e.t0=e.catch(0),e.t0.response.data.error?h(e.t0.response.data.error):h(e.t0.response.data);case 10:case"end":return e.stop()}}),e,null,[[0,7]])})));return function(){return e.apply(this,arguments)}}();return Object(w.jsxs)(d.a,{children:[Object(w.jsx)(z,{loading:i,user:n,logout:g}),Object(w.jsx)(ae,{message:O}),i?Object(w.jsx)(x.a,{height:"50px"}):Object(w.jsx)(je,{user:n,loginUser:f})]})};s.a.render(Object(w.jsx)(i.a,{children:Object(w.jsx)(a.a.StrictMode,{children:Object(w.jsx)(le,{})})}),document.getElementById("root"))}},[[142,1,2]]]);
//# sourceMappingURL=main.e1ba1f4e.chunk.js.map