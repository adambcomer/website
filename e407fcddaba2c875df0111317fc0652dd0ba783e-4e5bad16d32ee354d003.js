(window.webpackJsonp=window.webpackJsonp||[]).push([[1],{"8+s/":function(e,t,n){"use strict";var r,a=n("q1tI"),o=(r=a)&&"object"==typeof r&&"default"in r?r.default:r;function i(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}var c=!("undefined"==typeof window||!window.document||!window.document.createElement);e.exports=function(e,t,n){if("function"!=typeof e)throw new Error("Expected reducePropsToState to be a function.");if("function"!=typeof t)throw new Error("Expected handleStateChangeOnClient to be a function.");if(void 0!==n&&"function"!=typeof n)throw new Error("Expected mapStateOnServer to either be undefined or a function.");return function(r){if("function"!=typeof r)throw new Error("Expected WrappedComponent to be a React component.");var l,s=[];function u(){l=e(s.map((function(e){return e.props}))),f.canUseDOM?t(l):n&&(l=n(l))}var f=function(e){var t,n;function a(){return e.apply(this,arguments)||this}n=e,(t=a).prototype=Object.create(n.prototype),t.prototype.constructor=t,t.__proto__=n,a.peek=function(){return l},a.rewind=function(){if(a.canUseDOM)throw new Error("You may only call rewind() on the server. Call peek() to read the current state.");var e=l;return l=void 0,s=[],e};var i=a.prototype;return i.UNSAFE_componentWillMount=function(){s.push(this),u()},i.componentDidUpdate=function(){u()},i.componentWillUnmount=function(){var e=s.indexOf(this);s.splice(e,1),u()},i.render=function(){return o.createElement(r,this.props)},a}(a.PureComponent);return i(f,"displayName","SideEffect("+function(e){return e.displayName||e.name||"Component"}(r)+")"),i(f,"canUseDOM",c),f}}},CwrG:function(e,t,n){"use strict";var r=n("Wbzz"),a=n("Kfvu"),o=n("q1tI"),i=n.n(o);n("RVoS");t.a=function(){return i.a.createElement(i.a.Fragment,null,i.a.createElement("hr",null),i.a.createElement("footer",{className:"grid lg:grid-cols-12 m-6"},i.a.createElement("div",{className:"lg:col-span-8"},i.a.createElement("span",{className:"text-2xl"},"ADAM COMER"),i.a.createElement("div",{className:"flex flex-row mt-6"},i.a.createElement("div",{className:"mr-4"},i.a.createElement(a.OutboundLink,{href:"mailto:adambcomer@gmail.com"},i.a.createElement("svg",{className:"icon w-8",xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 32 32"},i.a.createElement("path",{d:"M28,6H4A2,2,0,0,0,2,8V24a2,2,0,0,0,2,2H28a2,2,0,0,0,2-2V8A2,2,0,0,0,28,6ZM25.8,8,16,14.78,6.2,8ZM4,24V8.91l11.43,7.91a1,1,0,0,0,1.14,0L28,8.91V24Z",transform:"translate(0)"})))),i.a.createElement("div",{className:"mx-4"},i.a.createElement(a.OutboundLink,{href:"https://www.linkedin.com/in/adambcomer"},i.a.createElement("svg",{className:"icon w-8",xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 32 32"},i.a.createElement("path",{d:"M26.21,4H5.79A1.78,1.78,0,0,0,4,5.73V26.2a1.77,1.77,0,0,0,1.79,1.73H26.21A1.77,1.77,0,0,0,28,26.2V5.73A1.78,1.78,0,0,0,26.21,4ZM11.11,24.41H7.59V13h3.52Zm-1.72-13A2.07,2.07,0,0,1,7.32,9.39,2,2,0,0,1,9.39,7.32a2.07,2.07,0,0,1,0,4.13ZM24.48,24.34H21V18.76c0-1.33,0-3.06-1.86-3.06S17,17.16,17,18.63v5.65H13.44V13h3.32V14.5h.07a3.72,3.72,0,0,1,3.39-1.86c3.59,0,4.26,2.4,4.26,5.45Z",transform:"translate(0 0)"})))),i.a.createElement("div",{className:"mx-4"},i.a.createElement(a.OutboundLink,{href:"https://github.com/adambcomer"},i.a.createElement("svg",{className:"icon w-8",xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 32 32"},i.a.createElement("path",{d:"M16,2a14,14,0,0,0-4.43,27.28c.7.13,1-.3,1-.67s0-1.21,0-2.38c-3.89.84-4.71-1.88-4.71-1.88A3.71,3.71,0,0,0,6.24,22.3c-1.27-.86.1-.85.1-.85A2.94,2.94,0,0,1,8.48,22.9a3,3,0,0,0,4.08,1.16,2.93,2.93,0,0,1,.88-1.87c-3.1-.36-6.37-1.56-6.37-6.92a5.4,5.4,0,0,1,1.44-3.76,5,5,0,0,1,.14-3.7s1.17-.38,3.85,1.43a13.3,13.3,0,0,1,7,0c2.67-1.81,3.84-1.43,3.84-1.43a5,5,0,0,1,.14,3.7,5.4,5.4,0,0,1,1.44,3.76c0,5.38-3.27,6.56-6.39,6.91a3.33,3.33,0,0,1,.95,2.59c0,1.87,0,3.38,0,3.84s.25.81,1,.67A14,14,0,0,0,16,2Z"})))),i.a.createElement("div",{className:"mx-4"},i.a.createElement(a.OutboundLink,{href:"https://twitter.com/adambcomer"},i.a.createElement("svg",{className:"icon w-8",xmlns:"http://www.w3.org/2000/svg",viewBox:"2 2 27 27"},i.a.createElement("path",{d:"M11.92,24.94A12.76,12.76,0,0,0,24.76,12.1c0-.2,0-.39,0-.59A9.4,9.4,0,0,0,27,9.18a9.31,9.31,0,0,1-2.59.71,4.56,4.56,0,0,0,2-2.5,8.89,8.89,0,0,1-2.86,1.1,4.52,4.52,0,0,0-7.7,4.11,12.79,12.79,0,0,1-9.3-4.71,4.51,4.51,0,0,0,1.4,6,4.47,4.47,0,0,1-2-.56v.05A4.53,4.53,0,0,0,9.5,17.83a4.53,4.53,0,0,1-2,.08A4.51,4.51,0,0,0,11.68,21,9.05,9.05,0,0,1,6.07,23,9.77,9.77,0,0,1,5,22.91a12.77,12.77,0,0,0,6.92,2",transform:"translate(0)"})))),i.a.createElement("div",{className:"mx-4"},i.a.createElement(a.OutboundLink,{href:"https://www.instagram.com/adamcomer/"},i.a.createElement("svg",{className:"icon w-8",xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 32 32"},i.a.createElement("circle",{cx:"22.4056",cy:"9.5944",r:"1.44"}),i.a.createElement("path",{d:"M16,9.8378A6.1622,6.1622,0,1,0,22.1622,16,6.1622,6.1622,0,0,0,16,9.8378ZM16,20a4,4,0,1,1,4-4A4,4,0,0,1,16,20Z"}),i.a.createElement("path",{d:"M16,6.1622c3.2041,0,3.5837.0122,4.849.07a6.6418,6.6418,0,0,1,2.2283.4132,3.9748,3.9748,0,0,1,2.2774,2.2774,6.6418,6.6418,0,0,1,.4132,2.2283c.0577,1.2653.07,1.6449.07,4.849s-.0122,3.5837-.07,4.849a6.6418,6.6418,0,0,1-.4132,2.2283,3.9748,3.9748,0,0,1-2.2774,2.2774,6.6418,6.6418,0,0,1-2.2283.4132c-1.2652.0577-1.6446.07-4.849.07s-3.5838-.0122-4.849-.07a6.6418,6.6418,0,0,1-2.2283-.4132,3.9748,3.9748,0,0,1-2.2774-2.2774,6.6418,6.6418,0,0,1-.4132-2.2283c-.0577-1.2653-.07-1.6449-.07-4.849s.0122-3.5837.07-4.849a6.6418,6.6418,0,0,1,.4132-2.2283A3.9748,3.9748,0,0,1,8.9227,6.6453a6.6418,6.6418,0,0,1,2.2283-.4132c1.2653-.0577,1.6449-.07,4.849-.07M16,4c-3.259,0-3.6677.0138-4.9476.0722A8.8068,8.8068,0,0,0,8.14,4.63,6.1363,6.1363,0,0,0,4.63,8.14a8.8068,8.8068,0,0,0-.5578,2.9129C4.0138,12.3323,4,12.741,4,16s.0138,3.6677.0722,4.9476A8.8074,8.8074,0,0,0,4.63,23.8605a6.1363,6.1363,0,0,0,3.51,3.51,8.8068,8.8068,0,0,0,2.9129.5578C12.3323,27.9862,12.741,28,16,28s3.6677-.0138,4.9476-.0722a8.8074,8.8074,0,0,0,2.9129-.5578,6.1363,6.1363,0,0,0,3.51-3.51,8.8074,8.8074,0,0,0,.5578-2.9129C27.9862,19.6677,28,19.259,28,16s-.0138-3.6677-.0722-4.9476A8.8068,8.8068,0,0,0,27.37,8.14a6.1363,6.1363,0,0,0-3.51-3.5095,8.8074,8.8074,0,0,0-2.9129-.5578C19.6677,4.0138,19.259,4,16,4Z"})))))),i.a.createElement("div",{className:"lg:col-span-4 mt-12 lg:mt-0"},i.a.createElement("div",{className:"text-lg font-semibold"},"Directory"),i.a.createElement("div",{className:"mt-2 text-lg hover:underline"},i.a.createElement(r.Link,{to:"/"},"Home")),i.a.createElement("div",{className:"mt-2 text-lg hover:underline"},i.a.createElement(r.Link,{to:"/blog"},"Blog")),i.a.createElement("div",{className:"mt-2 text-lg hover:underline"},i.a.createElement(r.Link,{to:"/projects"},"Projects")),i.a.createElement("div",{className:"mt-2 text-lg hover:underline"},i.a.createElement(r.Link,{to:"/experience"},"Experience"))),i.a.createElement("div",{className:"lg:col-span-12 mt-12 lg:mt-0"},"© 2021 Adam Comer — All rights reserved")))}},Kfvu:function(e,t,n){"use strict";var r=n("TqRt");t.__esModule=!0,t.OutboundLink=l,t.trackCustomEvent=function(e){var t=e.category,n=e.action,r=e.label,a=e.value,o=e.nonInteraction,i=void 0!==o&&o,c=e.transport,l=e.hitCallback,s=e.callbackTimeout,u=void 0===s?1e3:s;if("undefined"!=typeof window&&window.ga){var f={eventCategory:t,eventAction:n,eventLabel:r,eventValue:a,nonInteraction:i,transport:c};l&&"function"==typeof l&&(f.hitCallback=function(e,t){void 0===t&&(t=1e3);var n=!1,r=function(){n||(n=!0,e())};return setTimeout(r,t),r}(l,u)),window.ga("send","event",f)}};var a=r(n("pVnL")),o=r(n("8OQS")),i=r(n("q1tI")),c=r(n("17x9"));function l(e){var t=e.eventCategory,n=e.eventAction,r=e.eventLabel,c=e.eventValue,l=(0,o.default)(e,["eventCategory","eventAction","eventLabel","eventValue"]);return i.default.createElement("a",(0,a.default)({},l,{onClick:function(a){"function"==typeof e.onClick&&e.onClick(a);var o=!0;return(0!==a.button||a.altKey||a.ctrlKey||a.metaKey||a.shiftKey||a.defaultPrevented)&&(o=!1),e.target&&"_self"!==e.target.toLowerCase()&&(o=!1),window.ga?window.ga("send","event",{eventCategory:t||"Outbound Link",eventAction:n||"click",eventLabel:r||e.href,eventValue:c,transport:o?"beacon":"",hitCallback:function(){o&&(document.location=e.href)}}):o&&(document.location=e.href),!1}}))}l.propTypes={href:c.default.string,target:c.default.string,eventCategory:c.default.string,eventAction:c.default.string,eventLabel:c.default.string,eventValue:c.default.number,onClick:c.default.func}},RVoS:function(e,t,n){},bmMU:function(e,t){var n="undefined"!=typeof Element,r="function"==typeof Map,a="function"==typeof Set,o="function"==typeof ArrayBuffer&&!!ArrayBuffer.isView;e.exports=function(e,t){try{return function e(t,i){if(t===i)return!0;if(t&&i&&"object"==typeof t&&"object"==typeof i){if(t.constructor!==i.constructor)return!1;var c,l,s,u;if(Array.isArray(t)){if((c=t.length)!=i.length)return!1;for(l=c;0!=l--;)if(!e(t[l],i[l]))return!1;return!0}if(r&&t instanceof Map&&i instanceof Map){if(t.size!==i.size)return!1;for(u=t.entries();!(l=u.next()).done;)if(!i.has(l.value[0]))return!1;for(u=t.entries();!(l=u.next()).done;)if(!e(l.value[1],i.get(l.value[0])))return!1;return!0}if(a&&t instanceof Set&&i instanceof Set){if(t.size!==i.size)return!1;for(u=t.entries();!(l=u.next()).done;)if(!i.has(l.value[0]))return!1;return!0}if(o&&ArrayBuffer.isView(t)&&ArrayBuffer.isView(i)){if((c=t.length)!=i.length)return!1;for(l=c;0!=l--;)if(t[l]!==i[l])return!1;return!0}if(t.constructor===RegExp)return t.source===i.source&&t.flags===i.flags;if(t.valueOf!==Object.prototype.valueOf)return t.valueOf()===i.valueOf();if(t.toString!==Object.prototype.toString)return t.toString()===i.toString();if((c=(s=Object.keys(t)).length)!==Object.keys(i).length)return!1;for(l=c;0!=l--;)if(!Object.prototype.hasOwnProperty.call(i,s[l]))return!1;if(n&&t instanceof Element)return!1;for(l=c;0!=l--;)if(("_owner"!==s[l]&&"__v"!==s[l]&&"__o"!==s[l]||!t.$$typeof)&&!e(t[s[l]],i[s[l]]))return!1;return!0}return t!=t&&i!=i}(e,t)}catch(i){if((i.message||"").match(/stack|recursion/i))return console.warn("react-fast-compare cannot handle circular refs"),!1;throw i}}},dIFN:function(e,t,n){},qhky:function(e,t,n){"use strict";(function(e){n.d(t,"a",(function(){return he}));n("E9XD");var r,a,o,i,c=n("17x9"),l=n.n(c),s=n("8+s/"),u=n.n(s),f=n("bmMU"),m=n.n(f),d=n("q1tI"),p=n.n(d),h=n("YVoz"),v=n.n(h),y="bodyAttributes",g="htmlAttributes",b="titleAttributes",w={BASE:"base",BODY:"body",HEAD:"head",HTML:"html",LINK:"link",META:"meta",NOSCRIPT:"noscript",SCRIPT:"script",STYLE:"style",TITLE:"title"},E=(Object.keys(w).map((function(e){return w[e]})),"charset"),T="cssText",A="href",x="http-equiv",C="innerHTML",O="itemprop",k="name",S="property",L="rel",N="src",j="target",M={accesskey:"accessKey",charset:"charSet",class:"className",contenteditable:"contentEditable",contextmenu:"contextMenu","http-equiv":"httpEquiv",itemprop:"itemProp",tabindex:"tabIndex"},P="defaultTitle",I="defer",R="encodeSpecialCharacters",H="onChangeClientState",B="titleTemplate",V=Object.keys(M).reduce((function(e,t){return e[M[t]]=t,e}),{}),q=[w.NOSCRIPT,w.SCRIPT,w.STYLE],_="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e},D=function(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")},F=function(){function e(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}return function(t,n,r){return n&&e(t.prototype,n),r&&e(t,r),t}}(),z=Object.assign||function(e){for(var t=1;t<arguments.length;t++){var n=arguments[t];for(var r in n)Object.prototype.hasOwnProperty.call(n,r)&&(e[r]=n[r])}return e},K=function(e,t){var n={};for(var r in e)t.indexOf(r)>=0||Object.prototype.hasOwnProperty.call(e,r)&&(n[r]=e[r]);return n},Y=function(e,t){if(!e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!t||"object"!=typeof t&&"function"!=typeof t?e:t},U=function(e){var t=!(arguments.length>1&&void 0!==arguments[1])||arguments[1];return!1===t?String(e):String(e).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#x27;")},Z=function(e){var t=Q(e,w.TITLE),n=Q(e,B);if(n&&t)return n.replace(/%s/g,(function(){return Array.isArray(t)?t.join(""):t}));var r=Q(e,P);return t||r||void 0},W=function(e){return Q(e,H)||function(){}},J=function(e,t){return t.filter((function(t){return void 0!==t[e]})).map((function(t){return t[e]})).reduce((function(e,t){return z({},e,t)}),{})},$=function(e,t){return t.filter((function(e){return void 0!==e[w.BASE]})).map((function(e){return e[w.BASE]})).reverse().reduce((function(t,n){if(!t.length)for(var r=Object.keys(n),a=0;a<r.length;a++){var o=r[a].toLowerCase();if(-1!==e.indexOf(o)&&n[o])return t.concat(n)}return t}),[])},G=function(e,t,n){var r={};return n.filter((function(t){return!!Array.isArray(t[e])||(void 0!==t[e]&&re("Helmet: "+e+' should be of type "Array". Instead found type "'+_(t[e])+'"'),!1)})).map((function(t){return t[e]})).reverse().reduce((function(e,n){var a={};n.filter((function(e){for(var n=void 0,o=Object.keys(e),i=0;i<o.length;i++){var c=o[i],l=c.toLowerCase();-1===t.indexOf(l)||n===L&&"canonical"===e[n].toLowerCase()||l===L&&"stylesheet"===e[l].toLowerCase()||(n=l),-1===t.indexOf(c)||c!==C&&c!==T&&c!==O||(n=c)}if(!n||!e[n])return!1;var s=e[n].toLowerCase();return r[n]||(r[n]={}),a[n]||(a[n]={}),!r[n][s]&&(a[n][s]=!0,!0)})).reverse().forEach((function(t){return e.push(t)}));for(var o=Object.keys(a),i=0;i<o.length;i++){var c=o[i],l=v()({},r[c],a[c]);r[c]=l}return e}),[]).reverse()},Q=function(e,t){for(var n=e.length-1;n>=0;n--){var r=e[n];if(r.hasOwnProperty(t))return r[t]}return null},X=(r=Date.now(),function(e){var t=Date.now();t-r>16?(r=t,e(t)):setTimeout((function(){X(e)}),0)}),ee=function(e){return clearTimeout(e)},te="undefined"!=typeof window?window.requestAnimationFrame&&window.requestAnimationFrame.bind(window)||window.webkitRequestAnimationFrame||window.mozRequestAnimationFrame||X:e.requestAnimationFrame||X,ne="undefined"!=typeof window?window.cancelAnimationFrame||window.webkitCancelAnimationFrame||window.mozCancelAnimationFrame||ee:e.cancelAnimationFrame||ee,re=function(e){return console&&"function"==typeof console.warn&&console.warn(e)},ae=null,oe=function(e,t){var n=e.baseTag,r=e.bodyAttributes,a=e.htmlAttributes,o=e.linkTags,i=e.metaTags,c=e.noscriptTags,l=e.onChangeClientState,s=e.scriptTags,u=e.styleTags,f=e.title,m=e.titleAttributes;le(w.BODY,r),le(w.HTML,a),ce(f,m);var d={baseTag:se(w.BASE,n),linkTags:se(w.LINK,o),metaTags:se(w.META,i),noscriptTags:se(w.NOSCRIPT,c),scriptTags:se(w.SCRIPT,s),styleTags:se(w.STYLE,u)},p={},h={};Object.keys(d).forEach((function(e){var t=d[e],n=t.newTags,r=t.oldTags;n.length&&(p[e]=n),r.length&&(h[e]=d[e].oldTags)})),t&&t(),l(e,p,h)},ie=function(e){return Array.isArray(e)?e.join(""):e},ce=function(e,t){void 0!==e&&document.title!==e&&(document.title=ie(e)),le(w.TITLE,t)},le=function(e,t){var n=document.getElementsByTagName(e)[0];if(n){for(var r=n.getAttribute("data-react-helmet"),a=r?r.split(","):[],o=[].concat(a),i=Object.keys(t),c=0;c<i.length;c++){var l=i[c],s=t[l]||"";n.getAttribute(l)!==s&&n.setAttribute(l,s),-1===a.indexOf(l)&&a.push(l);var u=o.indexOf(l);-1!==u&&o.splice(u,1)}for(var f=o.length-1;f>=0;f--)n.removeAttribute(o[f]);a.length===o.length?n.removeAttribute("data-react-helmet"):n.getAttribute("data-react-helmet")!==i.join(",")&&n.setAttribute("data-react-helmet",i.join(","))}},se=function(e,t){var n=document.head||document.querySelector(w.HEAD),r=n.querySelectorAll(e+"[data-react-helmet]"),a=Array.prototype.slice.call(r),o=[],i=void 0;return t&&t.length&&t.forEach((function(t){var n=document.createElement(e);for(var r in t)if(t.hasOwnProperty(r))if(r===C)n.innerHTML=t.innerHTML;else if(r===T)n.styleSheet?n.styleSheet.cssText=t.cssText:n.appendChild(document.createTextNode(t.cssText));else{var c=void 0===t[r]?"":t[r];n.setAttribute(r,c)}n.setAttribute("data-react-helmet","true"),a.some((function(e,t){return i=t,n.isEqualNode(e)}))?a.splice(i,1):o.push(n)})),a.forEach((function(e){return e.parentNode.removeChild(e)})),o.forEach((function(e){return n.appendChild(e)})),{oldTags:a,newTags:o}},ue=function(e){return Object.keys(e).reduce((function(t,n){var r=void 0!==e[n]?n+'="'+e[n]+'"':""+n;return t?t+" "+r:r}),"")},fe=function(e){var t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{};return Object.keys(e).reduce((function(t,n){return t[M[n]||n]=e[n],t}),t)},me=function(e,t,n){switch(e){case w.TITLE:return{toComponent:function(){return e=t.title,n=t.titleAttributes,(r={key:e})["data-react-helmet"]=!0,a=fe(n,r),[p.a.createElement(w.TITLE,a,e)];var e,n,r,a},toString:function(){return function(e,t,n,r){var a=ue(n),o=ie(t);return a?"<"+e+' data-react-helmet="true" '+a+">"+U(o,r)+"</"+e+">":"<"+e+' data-react-helmet="true">'+U(o,r)+"</"+e+">"}(e,t.title,t.titleAttributes,n)}};case y:case g:return{toComponent:function(){return fe(t)},toString:function(){return ue(t)}};default:return{toComponent:function(){return function(e,t){return t.map((function(t,n){var r,a=((r={key:n})["data-react-helmet"]=!0,r);return Object.keys(t).forEach((function(e){var n=M[e]||e;if(n===C||n===T){var r=t.innerHTML||t.cssText;a.dangerouslySetInnerHTML={__html:r}}else a[n]=t[e]})),p.a.createElement(e,a)}))}(e,t)},toString:function(){return function(e,t,n){return t.reduce((function(t,r){var a=Object.keys(r).filter((function(e){return!(e===C||e===T)})).reduce((function(e,t){var a=void 0===r[t]?t:t+'="'+U(r[t],n)+'"';return e?e+" "+a:a}),""),o=r.innerHTML||r.cssText||"",i=-1===q.indexOf(e);return t+"<"+e+' data-react-helmet="true" '+a+(i?"/>":">"+o+"</"+e+">")}),"")}(e,t,n)}}}},de=function(e){var t=e.baseTag,n=e.bodyAttributes,r=e.encode,a=e.htmlAttributes,o=e.linkTags,i=e.metaTags,c=e.noscriptTags,l=e.scriptTags,s=e.styleTags,u=e.title,f=void 0===u?"":u,m=e.titleAttributes;return{base:me(w.BASE,t,r),bodyAttributes:me(y,n,r),htmlAttributes:me(g,a,r),link:me(w.LINK,o,r),meta:me(w.META,i,r),noscript:me(w.NOSCRIPT,c,r),script:me(w.SCRIPT,l,r),style:me(w.STYLE,s,r),title:me(w.TITLE,{title:f,titleAttributes:m},r)}},pe=u()((function(e){return{baseTag:$([A,j],e),bodyAttributes:J(y,e),defer:Q(e,I),encode:Q(e,R),htmlAttributes:J(g,e),linkTags:G(w.LINK,[L,A],e),metaTags:G(w.META,[k,E,x,S,O],e),noscriptTags:G(w.NOSCRIPT,[C],e),onChangeClientState:W(e),scriptTags:G(w.SCRIPT,[N,C],e),styleTags:G(w.STYLE,[T],e),title:Z(e),titleAttributes:J(b,e)}}),(function(e){ae&&ne(ae),e.defer?ae=te((function(){oe(e,(function(){ae=null}))})):(oe(e),ae=null)}),de)((function(){return null})),he=(a=pe,i=o=function(e){function t(){return D(this,t),Y(this,e.apply(this,arguments))}return function(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function, not "+typeof t);e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,enumerable:!1,writable:!0,configurable:!0}}),t&&(Object.setPrototypeOf?Object.setPrototypeOf(e,t):e.__proto__=t)}(t,e),t.prototype.shouldComponentUpdate=function(e){return!m()(this.props,e)},t.prototype.mapNestedChildrenToProps=function(e,t){if(!t)return null;switch(e.type){case w.SCRIPT:case w.NOSCRIPT:return{innerHTML:t};case w.STYLE:return{cssText:t}}throw new Error("<"+e.type+" /> elements are self-closing and can not contain children. Refer to our API for more information.")},t.prototype.flattenArrayTypeChildren=function(e){var t,n=e.child,r=e.arrayTypeChildren,a=e.newChildProps,o=e.nestedChildren;return z({},r,((t={})[n.type]=[].concat(r[n.type]||[],[z({},a,this.mapNestedChildrenToProps(n,o))]),t))},t.prototype.mapObjectTypeChildren=function(e){var t,n,r=e.child,a=e.newProps,o=e.newChildProps,i=e.nestedChildren;switch(r.type){case w.TITLE:return z({},a,((t={})[r.type]=i,t.titleAttributes=z({},o),t));case w.BODY:return z({},a,{bodyAttributes:z({},o)});case w.HTML:return z({},a,{htmlAttributes:z({},o)})}return z({},a,((n={})[r.type]=z({},o),n))},t.prototype.mapArrayTypeChildrenToProps=function(e,t){var n=z({},t);return Object.keys(e).forEach((function(t){var r;n=z({},n,((r={})[t]=e[t],r))})),n},t.prototype.warnOnInvalidChildren=function(e,t){return!0},t.prototype.mapChildrenToProps=function(e,t){var n=this,r={};return p.a.Children.forEach(e,(function(e){if(e&&e.props){var a=e.props,o=a.children,i=function(e){var t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{};return Object.keys(e).reduce((function(t,n){return t[V[n]||n]=e[n],t}),t)}(K(a,["children"]));switch(n.warnOnInvalidChildren(e,o),e.type){case w.LINK:case w.META:case w.NOSCRIPT:case w.SCRIPT:case w.STYLE:r=n.flattenArrayTypeChildren({child:e,arrayTypeChildren:r,newChildProps:i,nestedChildren:o});break;default:t=n.mapObjectTypeChildren({child:e,newProps:t,newChildProps:i,nestedChildren:o})}}})),t=this.mapArrayTypeChildrenToProps(r,t)},t.prototype.render=function(){var e=this.props,t=e.children,n=K(e,["children"]),r=z({},n);return t&&(r=this.mapChildrenToProps(t,r)),p.a.createElement(a,r)},F(t,null,[{key:"canUseDOM",set:function(e){a.canUseDOM=e}}]),t}(p.a.Component),o.propTypes={base:l.a.object,bodyAttributes:l.a.object,children:l.a.oneOfType([l.a.arrayOf(l.a.node),l.a.node]),defaultTitle:l.a.string,defer:l.a.bool,encodeSpecialCharacters:l.a.bool,htmlAttributes:l.a.object,link:l.a.arrayOf(l.a.object),meta:l.a.arrayOf(l.a.object),noscript:l.a.arrayOf(l.a.object),onChangeClientState:l.a.func,script:l.a.arrayOf(l.a.object),style:l.a.arrayOf(l.a.object),title:l.a.string,titleAttributes:l.a.object,titleTemplate:l.a.string},o.defaultProps={defer:!0,encodeSpecialCharacters:!0},o.peek=a.peek,o.rewind=function(){var e=a.rewind();return e||(e=de({baseTag:[],bodyAttributes:{},encodeSpecialCharacters:!0,htmlAttributes:{},linkTags:[],metaTags:[],noscriptTags:[],scriptTags:[],styleTags:[],title:"",titleAttributes:{}})),e},i);he.renderStatic=he.rewind}).call(this,n("yLpj"))},vOmp:function(e,t,n){"use strict";var r=n("q1tI"),a=n.n(r),o=n("Wbzz");n("dIFN");t.a=function(){var e=Object(r.useState)(!1),t=e[0],n=e[1];function i(){document.body.classList.remove("overflow-hidden")}return a.a.createElement("nav",{className:"flex flex-row m-6"},a.a.createElement("div",{className:"flex-1"},a.a.createElement("span",{className:"flex-1 text-2xl"},a.a.createElement(o.Link,{to:"/",onClick:i},"ADAM COMER"))),a.a.createElement("div",{className:"flex flex-row hidden lg:block"},a.a.createElement("span",{className:"mx-4 text-lg hover:underline"},a.a.createElement(o.Link,{to:"/",onClick:i},"Home")),a.a.createElement("span",{className:"mx-4 text-lg hover:underline"},a.a.createElement(o.Link,{to:"/blog",onClick:i},"Blog")),a.a.createElement("span",{className:"mx-4 text-lg hover:underline"},a.a.createElement(o.Link,{to:"/projects",onClick:i},"Projects")),a.a.createElement("span",{className:"mx-4 text-lg hover:underline"},a.a.createElement(o.Link,{to:"/experience",onClick:i},"Experience"))),a.a.createElement("svg",{className:"icon lg:hidden",version:"1.1",id:"icon",xmlns:"http://www.w3.org/2000/svg",x:"0px",y:"0px",width:"32px",height:"32px",viewBox:"0 0 32 32",onClick:function(){n(!t),t?document.body.classList.remove("overflow-hidden"):document.body.classList.add("overflow-hidden")}},a.a.createElement("rect",{x:"14",y:"4",width:"4",height:"4"}),a.a.createElement("rect",{x:"4",y:"4",width:"4",height:"4"}),a.a.createElement("rect",{x:"24",y:"4",width:"4",height:"4"}),a.a.createElement("rect",{x:"14",y:"14",width:"4",height:"4"}),a.a.createElement("rect",{x:"4",y:"14",width:"4",height:"4"}),a.a.createElement("rect",{x:"24",y:"14",width:"4",height:"4"}),a.a.createElement("rect",{x:"14",y:"24",width:"4",height:"4"}),a.a.createElement("rect",{x:"4",y:"24",width:"4",height:"4"}),a.a.createElement("rect",{x:"24",y:"24",width:"4",height:"4"})),t&&a.a.createElement("div",{className:"fixed lg:hidden bottom-0 left-0 right-0 z-50 mobile-nav"},a.a.createElement("hr",null),a.a.createElement("div",{className:"ml-8 mt-8 text-xl hover:underline"},a.a.createElement(o.Link,{to:"/",onClick:i},"Home")),a.a.createElement("div",{className:"ml-8 mt-8 text-xl hover:underline"},a.a.createElement(o.Link,{to:"/blog",onClick:i},"Blog")),a.a.createElement("div",{className:"ml-8 mt-8 text-xl hover:underline"},a.a.createElement(o.Link,{to:"/projects",onClick:i},"Projects")),a.a.createElement("div",{className:"ml-8 mt-8 text-xl hover:underline"},a.a.createElement(o.Link,{to:"/experience",onClick:i},"Experience"))))}}}]);
//# sourceMappingURL=e407fcddaba2c875df0111317fc0652dd0ba783e-4e5bad16d32ee354d003.js.map