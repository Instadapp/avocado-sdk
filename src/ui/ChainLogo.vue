<template>
  <svg v-if="chain == '137'" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <rect width="22" height="22" x="1" y="1" fill="url(#paint0_linear_3811_156082)" rx="11" />
    <path fill="#fff"
      d="M15.086 9.927a.791.791 0 0 0-.752 0L12.58 10.97l-1.191.665-1.723 1.045a.791.791 0 0 1-.752 0l-1.347-.823a.773.773 0 0 1-.376-.665V9.61c0-.253.125-.506.376-.664l1.347-.792a.791.791 0 0 1 .752 0l1.347.823c.22.127.376.38.376.665v1.045l1.19-.697V8.914a.782.782 0 0 0-.375-.665L9.697 6.762a.791.791 0 0 0-.752 0L6.376 8.28A.697.697 0 0 0 6 8.914v2.975c0 .254.125.507.376.665l2.538 1.488c.22.126.501.126.752 0l1.723-1.013 1.19-.697 1.724-1.012a.791.791 0 0 1 .752 0l1.347.79c.22.128.376.38.376.666v1.582a.782.782 0 0 1-.376.665l-1.316.791a.791.791 0 0 1-.752 0l-1.347-.791a.773.773 0 0 1-.376-.665v-1.013l-1.19.697v1.044c0 .253.125.507.375.665l2.538 1.487c.22.127.502.127.752 0l2.538-1.487a.773.773 0 0 0 .376-.665V12.08a.782.782 0 0 0-.376-.665l-2.538-1.487Z" />
    <rect v-if="stroke" :class="strokeClass" width="22" height="22" x="1" y="1" rx="11" />
    <defs>
      <linearGradient id="paint0_linear_3811_156082" x1="12" x2="12" y1="2" y2="22" gradientUnits="userSpaceOnUse">
        <stop stop-color="#A177FA" />
        <stop offset="1" stop-color="#7A4ADD" />
      </linearGradient>
    </defs>
  </svg>
  <svg v-else-if="chain == '42161'" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <rect width="22" height="22" x="1" y="1" fill="url(#paint0_linear_3811_156100)" rx="11" />
    <path fill="#28A0F0"
      d="m12.031 13.969 1.704 2.673 1.574-.912-2.238-3.526-1.04 1.765ZM16.743 14.658v-.73l-2.445-3.808-.907 1.539 2.36 3.817.853-.495a.378.378 0 0 0 .14-.275v-.048Z" />
    <path fill="#fff"
      d="m6.5 15.347 1.205.694 4.01-6.43-.68-.018c-.58-.008-1.205.142-1.492.61l-2.277 3.53L6.5 14.91v.437ZM14.023 9.61l-1.793.007-4.058 6.696 1.418.817.386-.654 4.047-6.865Z" />
    <path fill="#96BEDC"
      d="M17.5 9.602a1.143 1.143 0 0 0-.536-.919l-4.46-2.564a1.16 1.16 0 0 0-1.022 0c-.037.019-4.336 2.512-4.336 2.512a1.146 1.146 0 0 0-.646.968v5.31l.766-1.176-.007-4.098a.377.377 0 0 1 .158-.285 2599 2599 0 0 1 4.406-2.552.388.388 0 0 1 .337-.002l4.401 2.532c.104.066.17.179.175.302v5.076a.37.37 0 0 1-.131.275l-.854.494-.44.255-1.574.912-1.595.925a.387.387 0 0 1-.272-.005l-1.888-1.086-.386.654 1.697.977a43.674 43.674 0 0 0 .27.15c.12.059.293.093.45.093.143 0 .283-.026.415-.078l4.635-2.685c.266-.206.423-.517.437-.854V9.602Z" />
    <rect v-if="stroke" :class="strokeClass" width="22" height="22" x="1" y="1" rx="11" />
    <defs>
      <linearGradient id="paint0_linear_3811_156100" x1="12" x2="12" y1="2" y2="22" gradientUnits="userSpaceOnUse">
        <stop stop-color="#495775" />
        <stop offset="1" stop-color="#2D374B" />
      </linearGradient>
    </defs>
  </svg>

  <svg v-else-if="chain == '43114'" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <rect width="22" height="22" x="1" y="1" fill="url(#paint0_linear_3811_156118)" rx="11" />
    <path fill="#fff" fill-rule="evenodd"
      d="M12.447 6.96c-.259-.447-.67-.447-.93 0l-4.696 8.27c-.258.453-.047.812.47.812H9.65c.476-.03.905-.283 1.164-.682l2.839-4.92a1.545 1.545 0 0 0 0-1.346l-.847-1.487-.358-.647Zm3.121 5.443c-.259-.447-.676-.447-.934 0l-1.64 2.827c-.253.447-.042.811.47.811h3.244c.518 0 .73-.364.47-.81l-1.61-2.828Z"
      clip-rule="evenodd" />
    <rect v-if="stroke" :class="strokeClass" width="22" height="22" x="1" y="1" rx="11" />
    <defs>
      <linearGradient id="paint0_linear_3811_156118" x1="12" x2="12" y1="2" y2="22" gradientUnits="userSpaceOnUse">
        <stop stop-color="#FF8585" />
        <stop offset="1" stop-color="#EB5757" />
      </linearGradient>
    </defs>
  </svg>

  <svg v-else-if="chain == '1'" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <rect width="22" height="22" x="1" y="1" fill="url(#paint0_linear_1_908)" rx="11" />
    <path fill="#fff" d="M8 12.111 11.998 6v.003L12 6l3.998 6.11.002.001-3.998 2.177h-.002L8 12.111Z" />
    <path fill="#fff" d="M11.998 17.997V18L8 12.81l3.998 2.176H12L16 12.81 12 18l-.002-.003Z" />
    <rect v-if="stroke" :class="strokeClass" width="22" height="22" x="1" y="1" rx="11" />
    <defs>
      <linearGradient id="paint0_linear_1_908" x1="12" x2="12" y1="2" y2="22" gradientUnits="userSpaceOnUse">
        <stop stop-color="#8E90FF" />
        <stop offset="1" stop-color="#5D5FEF" />
      </linearGradient>
    </defs>
  </svg>



  <svg v-else-if="chain == '10'" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <rect width="22" height="22" x="1" y="1" fill="url(#paint0_linear_1_905)" rx="11" />
    <path fill="#fff"
      d="M9.084 14.656c-.596 0-1.084-.14-1.464-.42-.376-.284-.564-.692-.564-1.216 0-.112.012-.244.036-.404a24.3 24.3 0 0 1 .276-1.3c.34-1.376 1.22-2.064 2.636-2.064.384 0 .732.064 1.036.196a1.532 1.532 0 0 1 .984 1.472c0 .104-.012.236-.036.396-.076.444-.164.88-.272 1.3-.176.684-.476 1.2-.908 1.54-.428.336-1.004.5-1.724.5Zm.108-1.08c.28 0 .516-.084.712-.248.2-.164.344-.416.428-.76.116-.472.204-.88.264-1.232.02-.104.032-.212.032-.324 0-.456-.236-.684-.712-.684a1.1 1.1 0 0 0-.72.248c-.196.164-.336.416-.42.76-.092.336-.18.744-.272 1.232-.02.1-.032.204-.032.316-.004.464.24.692.72.692ZM12.372 14.584c-.056 0-.096-.016-.128-.052-.024-.04-.032-.084-.024-.136l1.036-4.88a.2.2 0 0 1 .084-.136.22.22 0 0 1 .144-.052h1.996c.556 0 1 .116 1.336.344.34.232.512.564.512 1 0 .124-.016.256-.044.392-.124.576-.376 1-.76 1.276-.376.276-.892.412-1.548.412h-1.012l-.344 1.644a.215.215 0 0 1-.084.136.22.22 0 0 1-.144.052h-1.02Zm2.656-2.868a.886.886 0 0 0 .548-.172.822.822 0 0 0 .316-.496c.016-.084.024-.16.024-.224 0-.144-.044-.256-.128-.332-.084-.08-.232-.12-.436-.12h-.9l-.284 1.344h.86Z" />
    <rect v-if="stroke" :class="strokeClass" width="22" height="22" x="1" y="1" rx="11" />
    <defs>
      <linearGradient id="paint0_linear_1_905" x1="12" x2="12" y1="2" y2="22" gradientUnits="userSpaceOnUse">
        <stop stop-color="#FF697A" />
        <stop offset="1" stop-color="#FF0420" />
      </linearGradient>
    </defs>
  </svg>

  <svg v-else-if="chain == '250'" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <rect width="22" height="22" x="1" y="1" fill="url(#paint0_linear_1_900)" rx="11" />
    <path fill="#fff" fill-rule="evenodd"
      d="M12.75 10.063 15 8.75v2.625l-2.25-1.313ZM15 15.686l-3 1.75-3-1.75v-3.062l3 1.75 3-1.75v3.063ZM9 8.75l2.25 1.313L9 11.374V8.75Zm3.375 1.938L14.625 12l-2.25 1.313v-2.626Zm-.75 2.624L9.375 12l2.25-1.313v2.626Zm3-5.187L12 9.625l-2.625-1.5L12 6.562l2.625 1.563Zm-6.375-.25v8.188L12 18.188l3.75-2.125V7.874L12 5.75 8.25 7.875Z"
      clip-rule="evenodd" />
    <rect v-if="stroke" :class="strokeClass" width="22" height="22" x="1" y="1" rx="11" />
    <defs>
      <linearGradient id="paint0_linear_1_900" x1="12" x2="12" y1="2" y2="22" gradientUnits="userSpaceOnUse">
        <stop stop-color="#65D8FF" />
        <stop offset="1" stop-color="#13B5EC" />
      </linearGradient>
    </defs>
  </svg>


  <svg v-else-if="chain == '100'" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <rect width="22" height="22" x="1" y="1" fill="url(#paint0_linear_1_911)" rx="11" />
    <g fill="#fff" clip-path="url(#clip0_1_911)">
      <path
        d="M9.527 12.833c.345 0 .681-.115.953-.325L8.293 10.32c-.527.68-.4 1.662.28 2.19.276.207.61.322.954.322ZM16.032 11.271c0-.345-.115-.681-.325-.953l-2.187 2.187a1.559 1.559 0 0 0 2.512-1.234Z" />
      <path
        d="m17.134 8.89-.968.968a2.204 2.204 0 0 1-3.103 3.104L12 14.024l-1.06-1.06a2.204 2.204 0 0 1-3.104-3.103l-.496-.497-.47-.473A6 6 0 1 0 18 12a5.985 5.985 0 0 0-.866-3.11Z" />
      <path
        d="M16.34 7.859a5.997 5.997 0 0 0-9.1.49L12 13.114l4.76-4.763a5.804 5.804 0 0 0-.42-.491ZM12 6.785c1.402 0 2.708.541 3.69 1.528L12 12.003l-3.69-3.69A5.157 5.157 0 0 1 12 6.785Z" />
    </g>
    <rect v-if="stroke" :class="strokeClass" width="22" height="22" x="1" y="1" rx="11" />
    <defs>
      <linearGradient id="paint0_linear_1_911" x1="12" x2="12" y1="2" y2="22" gradientUnits="userSpaceOnUse">
        <stop stop-color="#2BA889" />
        <stop offset="1" stop-color="#04795C" />
      </linearGradient>
      <clipPath id="clip0_1_911">
        <path fill="#fff" d="M6 6h12v12H6z" />
      </clipPath>
    </defs>
  </svg>

  <svg v-else-if="chain == '56'" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <rect width="22" height="22" x="1" y="1" fill="url(#paint0_linear_1_917)" rx="11" />
    <path fill="#fff"
      d="M13.13 15.965v1.346L11.983 18l-1.113-.69v-1.345l1.113.69 1.145-.69ZM7 11.31l1.113.69v2.308l1.916 1.173v1.346L7 14.997V11.31Zm9.967 0v3.693l-3.061 1.83v-1.346l1.916-1.174v-2.307l1.145-.696ZM13.9 9.481l1.146.69v1.345l-1.917 1.174v2.34l-1.113.69-1.107-.69v-2.346l-1.987-1.173v-1.346l1.145-.69 1.917 1.174L13.9 9.48Zm-4.978 2.997 1.113.69v1.345l-1.113-.69v-1.345Zm6.124 0v1.346l-1.113.69v-1.346l1.113-.69Zm-6.933-4.17 1.145.69-1.145.689v1.345L7 10.342V8.998l1.113-.69Zm7.742 0 1.145.69v1.345l-1.146.69V9.686l-1.112-.69 1.112-.69Zm-3.871 0 1.145.69-1.145.689-1.113-.69 1.113-.69Zm0-2.308 3.062 1.83-1.113.689-1.917-1.173-1.954 1.173-1.113-.69L11.984 6Z" />
    <rect v-if="stroke" :class="strokeClass" width="22" height="22" x="1" y="1" rx="11" />
    <defs>
      <linearGradient id="paint0_linear_1_917" x1="12" x2="12" y1="2" y2="22" gradientUnits="userSpaceOnUse">
        <stop stop-color="#FFD97C" />
        <stop offset="1" stop-color="#F3BA2F" />
      </linearGradient>
    </defs>
  </svg>



  <template v-else>
    <svg v-bind="$attrs" class="dark:hidden block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
      <rect width="20" height="20" fill="#CBD5E1" rx="10" />
      <path fill="#fff" fill-rule="evenodd"
        d="M10 3.999A6 6 0 1 0 10 16a6 6 0 0 0 0-12.001Zm0 10.8a4.8 4.8 0 1 1 0-9.6 4.8 4.8 0 0 1 0 9.6ZM6.399 9.67A3.6 3.6 0 0 1 9.68 6.4a.3.3 0 0 1 .318.318v.6a.294.294 0 0 1-.264.282A2.4 2.4 0 0 0 7.6 9.735a.294.294 0 0 1-.3.264h-.6a.312.312 0 0 1-.222-.096.336.336 0 0 1-.078-.234Z"
        clip-rule="evenodd" />
    </svg>
    <svg v-bind="$attrs" class="dark:block hidden" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
      <rect width="20" height="20" fill="#334155" rx="10" />
      <path fill="#97A2B7" fill-rule="evenodd"
        d="M10 3.999A6 6 0 1 0 10 16a6 6 0 0 0 0-12.001Zm0 10.8a4.8 4.8 0 1 1 0-9.6 4.8 4.8 0 0 1 0 9.6ZM6.399 9.67A3.6 3.6 0 0 1 9.68 6.4a.3.3 0 0 1 .318.318v.6a.294.294 0 0 1-.264.282A2.4 2.4 0 0 0 7.6 9.735a.294.294 0 0 1-.3.264h-.6a.312.312 0 0 1-.222-.096.336.336 0 0 1-.078-.234Z"
        clip-rule="evenodd" />
    </svg>
  </template>
</template>

<script lang=ts setup>
 defineProps({
  chain: [String, Number],
  stroke: {
    type: Boolean,
    default: false,
  },
});

const strokeClass = "dark:stroke-gray-900 stroke-slate-50 stroke-2";
</script>
