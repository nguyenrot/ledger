<script setup lang="ts">
import { ApiError, TOKEN_LENGTH, TOKEN_PATTERN, useLedgerApi } from '~/composables/useLedgerApi'
import { useToken } from '~/composables/useToken'

type Mode = 'choose' | 'create' | 'login'

const api = useLedgerApi()
const { setToken } = useToken()

const mode = ref<Mode>('choose')
const input = ref('')
const error = ref('')
const busy = ref(false)

function go(next: Mode) {
  mode.value = next
  input.value = ''
  error.value = ''
}

const isValid = computed(() => TOKEN_PATTERN.test(input.value))
const remaining = computed(() => Math.max(0, TOKEN_LENGTH - input.value.length))

const slots = computed(() =>
  Array.from({ length: TOKEN_LENGTH }, (_, i) => input.value[i] ?? ''),
)

async function handleCreate() {
  if (!isValid.value) {
    error.value = `Token phải đúng ${TOKEN_LENGTH} ký tự, chỉ chữ và số.`
    return
  }
  busy.value = true
  error.value = ''
  try {
    await api.createAccount(input.value)
    setToken(input.value)
  } catch (e) {
    if (e instanceof ApiError && e.status === 409) {
      error.value = 'Token này đã có người dùng. Hãy chọn token khác.'
    } else {
      error.value = (e as Error).message || 'Không tạo được account.'
    }
  } finally {
    busy.value = false
  }
}

async function handleLogin() {
  if (!isValid.value) {
    error.value = `Token phải đúng ${TOKEN_LENGTH} ký tự, chỉ chữ và số.`
    return
  }
  busy.value = true
  error.value = ''
  try {
    setToken(input.value)
    await api.me()
  } catch (e) {
    setToken(null)
    if (e instanceof ApiError && e.status === 401) {
      error.value = 'Token không tồn tại. Anh nhập lại hoặc chuyển sang "Tạo account".'
    } else {
      error.value = (e as Error).message || 'Không xác thực được token.'
    }
  } finally {
    busy.value = false
  }
}
</script>

<template>
  <main class="min-h-[100dvh] grid lg:grid-cols-[5fr_6fr] xl:grid-cols-[1fr_1fr]">
    <!-- Left: intro / brand panel — fades into a token-preview grid on desktop -->
    <aside
      class="relative hidden lg:flex flex-col justify-between p-10 xl:p-14 border-r border-[var(--color-border)] overflow-hidden"
    >
      <!-- Subtle ambient — a static grid of dim characters, no animation -->
      <div
        aria-hidden="true"
        class="absolute inset-0 opacity-[0.05] pointer-events-none select-none num text-[var(--color-text)]"
        style="
          background-image:
            linear-gradient(var(--color-border) 1px, transparent 1px),
            linear-gradient(90deg, var(--color-border) 1px, transparent 1px);
          background-size: 64px 64px;
          mask-image: radial-gradient(ellipse at 30% 40%, black 0%, transparent 75%);
          -webkit-mask-image: radial-gradient(ellipse at 30% 40%, black 0%, transparent 75%);
        "
      />

      <div class="relative z-10">
        <div class="flex items-center gap-2">
          <span class="relative flex w-2.5 h-2.5">
            <span class="absolute inset-0 rounded-full bg-[var(--color-accent)] breathe-ring" />
            <span class="relative rounded-full w-2.5 h-2.5 bg-[var(--color-accent)]" />
          </span>
          <span class="eyebrow">Ledger · kynguyen.cc</span>
        </div>
      </div>

      <div class="relative z-10 max-w-md">
        <h1 class="text-5xl xl:text-6xl font-semibold leading-[0.95] tracking-tight">
          Ghi sổ
          <br />
          <span class="text-[var(--color-accent)]">thu chi</span>
          <span class="text-[var(--color-text-dim)]">.</span>
        </h1>
        <p class="mt-5 text-base text-[var(--color-text-muted)] leading-relaxed max-w-[42ch]">
          Một sổ tay riêng — không quảng cáo, không tracking, không tài khoản dài dòng.
          Mười ký tự là toàn bộ định danh của anh.
        </p>

        <div class="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm">
          <div class="flex items-center gap-2 text-[var(--color-text-muted)]">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-[var(--color-accent)]">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            Server chỉ giữ hash
          </div>
          <div class="flex items-center gap-2 text-[var(--color-text-muted)]">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-[var(--color-accent)]">
              <circle cx="12" cy="12" r="9" />
              <polyline points="12 7 12 12 15 14" />
            </svg>
            Đồng bộ mọi thiết bị
          </div>
          <div class="flex items-center gap-2 text-[var(--color-text-muted)]">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-[var(--color-accent)]">
              <path d="M20.59 13.41 13.42 20.58a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82Z" />
              <line x1="7" y1="7" x2="7.01" y2="7" />
            </svg>
            Vĩnh viễn miễn phí
          </div>
        </div>
      </div>

      <div class="relative z-10 text-xs text-[var(--color-text-dim)]">
        Tự đặt · Tự nhớ · Không reset được
      </div>
    </aside>

    <!-- Right: action card -->
    <section class="flex items-center justify-center p-5 lg:p-10">
      <div class="w-full max-w-md">
        <!-- Mobile-only header — desktop version lives in the aside -->
        <div class="lg:hidden mb-7">
          <div class="flex items-center gap-2 mb-6">
            <span class="relative flex w-2 h-2">
              <span class="absolute inset-0 rounded-full bg-[var(--color-accent)] breathe-ring" />
              <span class="relative rounded-full w-2 h-2 bg-[var(--color-accent)]" />
            </span>
            <span class="eyebrow">Ledger</span>
          </div>
          <h1 class="text-4xl font-semibold leading-[0.95] tracking-tight">
            Ghi sổ
            <span class="text-[var(--color-accent)]">thu chi</span><span class="text-[var(--color-text-dim)]">.</span>
          </h1>
          <p class="mt-3 text-sm text-[var(--color-text-muted)] leading-relaxed">
            Một token {{ TOKEN_LENGTH }} ký tự là toàn bộ tài khoản. Tự đặt, tự nhớ — mất là mất.
          </p>
        </div>

        <!-- choose -->
        <div v-if="mode === 'choose'" class="space-y-3">
          <div class="eyebrow mb-4 hidden lg:block">Bắt đầu</div>
          <button
            class="btn btn-primary w-full !py-3.5 text-base font-semibold group"
            @click="go('create')"
          >
            <span>Tạo tài khoản mới</span>
            <svg class="transition-transform group-hover:translate-x-0.5" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </button>
          <button
            class="btn btn-ghost w-full !py-3.5 text-base"
            @click="go('login')"
          >
            Đã có token, đăng nhập
          </button>
        </div>

        <!-- create new -->
        <form v-else-if="mode === 'create'" class="space-y-5" @submit.prevent="handleCreate">
          <div>
            <div class="flex items-baseline justify-between mb-2">
              <label class="label">Chọn token mới</label>
              <span class="label-dim num">{{ input.length }} / {{ TOKEN_LENGTH }}</span>
            </div>
            <input
              v-model="input"
              type="text"
              spellcheck="false"
              autocomplete="off"
              autocapitalize="off"
              :maxlength="TOKEN_LENGTH"
              class="input num text-lg tracking-[0.18em] uppercase"
              placeholder="NguyenA123"
            />
            <!-- Slot preview — visual confirmation of progress -->
            <div class="mt-3 grid grid-cols-10 gap-1">
              <div
                v-for="(c, i) in slots"
                :key="i"
                class="h-1 rounded-full transition-colors duration-200"
                :class="c ? 'bg-[var(--color-accent)]' : 'bg-[var(--color-surface-3)]'"
              />
            </div>
            <p class="mt-3 text-xs flex items-center gap-1.5"
               :class="isValid ? 'text-[var(--color-income)]' : 'text-[var(--color-text-dim)]'">
              <svg v-if="isValid" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              {{ isValid ? 'Hợp lệ' : remaining > 0 ? `còn ${remaining} ký tự` : 'chỉ A–Z, a–z, 0–9' }}
            </p>
          </div>

          <div class="surface-2 border border-[var(--color-warning)]/25 p-3.5 flex gap-3">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-[var(--color-warning)] shrink-0 mt-0.5">
              <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            <div>
              <div class="text-xs font-semibold text-[var(--color-warning)] mb-0.5">Không reset được</div>
              <div class="text-xs text-[var(--color-text-muted)] leading-relaxed">
                Server chỉ lưu hash SHA-256. Hãy ghi token vào nơi an toàn.
              </div>
            </div>
          </div>

          <p v-if="error" class="text-xs text-[var(--color-expense)]">{{ error }}</p>

          <div class="flex gap-2 pt-1">
            <button type="button" class="btn btn-ghost flex-1" :disabled="busy" @click="go('choose')">Quay lại</button>
            <button type="submit" class="btn btn-primary flex-1" :disabled="busy || !isValid">
              {{ busy ? 'Đang tạo…' : 'Tạo & vào' }}
            </button>
          </div>
        </form>

        <!-- login existing -->
        <form v-else-if="mode === 'login'" class="space-y-5" @submit.prevent="handleLogin">
          <div>
            <div class="flex items-baseline justify-between mb-2">
              <label class="label">Nhập token đã có</label>
              <span class="label-dim num">{{ input.length }} / {{ TOKEN_LENGTH }}</span>
            </div>
            <input
              v-model="input"
              type="text"
              spellcheck="false"
              autocomplete="off"
              autocapitalize="off"
              :maxlength="TOKEN_LENGTH"
              class="input num text-lg tracking-[0.18em] uppercase"
              placeholder="Token đã có"
            />
            <div class="mt-3 grid grid-cols-10 gap-1">
              <div
                v-for="(c, i) in slots"
                :key="i"
                class="h-1 rounded-full transition-colors duration-200"
                :class="c ? 'bg-[var(--color-accent)]' : 'bg-[var(--color-surface-3)]'"
              />
            </div>
            <p class="mt-3 text-xs text-[var(--color-text-dim)]">
              {{ remaining > 0 ? `còn ${remaining} ký tự` : 'sẵn sàng' }}
            </p>
          </div>

          <p v-if="error" class="text-xs text-[var(--color-expense)]">{{ error }}</p>

          <div class="flex gap-2 pt-1">
            <button type="button" class="btn btn-ghost flex-1" :disabled="busy" @click="go('choose')">Quay lại</button>
            <button type="submit" class="btn btn-primary flex-1" :disabled="busy || !isValid">
              {{ busy ? 'Đang xác thực…' : 'Vào app' }}
            </button>
          </div>
        </form>
      </div>
    </section>
  </main>
</template>
