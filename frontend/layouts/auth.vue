<template>
  <v-app theme="dark">
    <div class="auth-layout">
      <!-- Background decoration -->
      <div class="auth-bg">
        <div class="auth-bg__orb auth-bg__orb--1" />
        <div class="auth-bg__orb auth-bg__orb--2" />
        <div class="auth-bg__grid" />
      </div>

      <div class="auth-content">
        <!-- Logo -->
        <div class="auth-logo mb-8">
          <div class="auth-logo__icon">
            <span class="text-h4 font-weight-black gold-text">₣</span>
          </div>
          <div class="ml-3">
            <div class="text-h6 font-weight-bold text-white">FinanceApp</div>
            <div class="text-caption" style="color: rgba(255,255,255,0.4)">Personal Finance Manager</div>
          </div>
        </div>

        <slot />
      </div>
    </div>
  </v-app>
</template>

<style scoped lang="scss">
.auth-layout {
  min-height: 100vh;
  background: linear-gradient(160deg, #041E4A 0%, #052962 60%, #063A7A 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  padding: 24px;
}

.auth-bg {
  position: fixed;
  inset: 0;
  pointer-events: none;

  &__orb {
    position: absolute;
    border-radius: 50%;
    filter: blur(80px);
    opacity: 0.15;
    &--1 {
      width: 600px; height: 600px;
      background: radial-gradient(circle, #41A9E0, transparent);
      top: -200px; right: -200px;
      animation: float 8s ease-in-out infinite;
    }
    &--2 {
      width: 400px; height: 400px;
      background: radial-gradient(circle, #0084C6, transparent);
      bottom: -100px; left: -100px;
      animation: float 10s ease-in-out infinite reverse;
    }
  }

  &__grid {
    position: absolute;
    inset: 0;
    background-image:
      linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px);
    background-size: 60px 60px;
  }
}

.auth-content {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 440px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.auth-logo {
  display: flex;
  align-items: center;

  &__icon {
    width: 52px; height: 52px;
    background: linear-gradient(135deg, rgba(65,169,224,0.25), rgba(65,169,224,0.08));
    border: 1px solid rgba(65,169,224,0.4);
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;

    span {
      background: linear-gradient(135deg, #FFFFFF, #41A9E0);
      -webkit-background-clip: text;
      background-clip: text;
    }
  }
}

@keyframes float {
  0%, 100% { transform: translateY(0) scale(1); }
  50%       { transform: translateY(-20px) scale(1.05); }
}
</style>
