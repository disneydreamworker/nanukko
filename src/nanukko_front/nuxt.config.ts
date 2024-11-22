// nuxt.config.ts
export default defineNuxtConfig({
  devtools: { enabled: true },
  // 컴포넌트 자동 import 설정
  components: {
    dirs: ["~/components", "~/components/payments"],
  },
  runtimeConfig: {
    apiSecret: '',
    public: {
      kakaoMapApiKey: process.env.NUXT_PUBLIC_KAKAO_MAP_API_KEY,
      apiBase: process.env.NUXT_PUBLIC_API_BASE || 'http://localhost:8080',
    }
  },
  // 토스 페이먼츠 스크립트
  app: {
    head: {
      script: [
        {
          src: `//dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NUXT_PUBLIC_KAKAO_MAP_API_KEY}&libraries=services&autoload=true`,
          type: 'text/javascript',
        },
        {
          src: "https://js.tosspayments.com/v1",
          defer: true,
        },
      ],
      link: [
        {
          rel: 'stylesheet',
          href: 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css'
        }
      ],
    },
  },

  // SSR 설정
  ssr: true,

  // 모듈 설정
  modules: [
    // 필요한 모듈들 추가
  ],

  // Vite 설정
  vite: {
    define: {
      'process.env.DEBUG': false,
      global: 'globalThis'
    },
    optimizeDeps: {
      include: ['sockjs-client']
    },
    server: {
      proxy: {
        '/api': {
          target: 'http://localhost:8080',
          changeOrigin: true,
          secure: false
        }
      }
    }
  },

  // 프록시 설정 (Nitro)
  nitro: {
    devProxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true
      }
    }
  },

  // 빌드 설정
  build: {
    transpile: ['@stomp/stompjs']
  },

  // 플러그인
  plugins: [
    { src: '~/plugins/socket', mode: 'client' }
  ],

  compatibilityDate: '2024-11-17'
})