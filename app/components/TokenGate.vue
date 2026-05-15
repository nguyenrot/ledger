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

function reset() {
  input.value = ''
  error.value = ''
}

function go(next: Mode) {
  mode.value = next
  reset()
}

const isValid = computed(() => TOKEN_PATTERN.test(input.value))
const remaining = computed(() => Math.max(0, TOKEN_LENGTH - input.value.length))

async function handleCreate() {
  error.value = ''
  if (!isValid.value) {
    error.value = `Token phải đúng ${TOKEN_LENGTH} ký tự, chỉ chữ và số.`
    return
  }
  busy.value = true
  try {
    await api.createAccount(input.value)
    setToken(input.value)
  } catch (e) {
    if (e instanceof ApiError && e.status === 409) {
      error.value = 'Token này đã có người dùng. Hãy chọn token khác.'
    } else if (e instanceof ApiError && e.status === 400) {
      error.value = (e as Error).message
    } else {
      error.value = (e as Error).message || 'Không tạo được account.'
    }
  } finally {
    busy.value = false
  }
}

async function handleLogin() {
  error.value = ''
  if (!isValid.value) {
    error.value = `Token phải đúng ${TOKEN_LENGTH} ký tự, chỉ chữ và số.`
    return
  }
  busy.value = true
  try {
    setToken(input.value)
    await api.me()
  } catch (e) {
    setToken(null)
    if (e instanceof ApiError && e.status === 401) {
      error.value = 'Token không tồn tại. Anh nhập lại hoặc chuyển sang “Tạo account”.'
    } else {
      error.value = (e as Error).message || 'Không xác thực được token.'
    }
  } finally {
    busy.value = false
  }
}
</script>

<template>
  <main class="relative z-10 min-h-screen flex items-center justify-center p-6">
    <div class="card card-glow w-full max-w-xl p-8 sm:p-10">
      <div class="flex items-center gap-3 mb-6">
        <div class="w-2 h-2 rounded-full bg-[var(--color-cyan)] pulse-rune shadow-[0_0_12px_var(--color-cyan)]" />
        <span class="label text-[var(--color-cyan)]">Auth · Token Mode</span>
      </div>

      <h1 class="text-3xl sm:text-4xl font-bold mb-2">
        <span class="text-[var(--color-cyan)]">Ledger</span>
        <span class="text-[var(--color-fg-muted)]">.kynguyen.cc</span>
      </h1>
      <p class="text-sm text-[var(--color-fg-muted)] mb-8">
        Một token {{ TOKEN_LENGTH }} ký tự (chữ + số) là toàn bộ tài khoản. Tự đặt, tự nhớ — mất là mất, không reset được.
      </p>

      <!-- choose -->
      <div v-if="mode === 'choose'" class="space-y-3">
        <button class="btn-primary w-full py-3 px-5 rounded-lg" @click="go('create')">
          ⊕ Tạo account mới
        </button>
        <button class="btn-ghost w-full py-3 px-5 rounded-lg" @click="go('login')">
          ⋯ Đã có token, đăng nhập
        </button>
      </div>

      <!-- create new -->
      <div v-else-if="mode === 'create'" class="space-y-4">
        <div>
          <span class="label block mb-2">Chọn token mới · {{ TOKEN_LENGTH }} ký tự</span>
          <input
            v-model="input"
            type="text"
            spellcheck="false"
            autocomplete="off"
            autocapitalize="off"
            :maxlength="TOKEN_LENGTH"
            class="input-field w-full px-4 py-3 rounded-lg text-lg font-display tracking-[0.25em]"
            placeholder="VD: NguyenA123"
            @keyup.enter="handleCreate"
          />
          <p class="mt-1.5 text-[10px] font-mono uppercase tracking-wider"
             :class="isValid ? 'text-[var(--color-emerald)]' : 'text-[var(--color-fg-dim)]'">
            {{ isValid ? '✓ hợp lệ' : remaining > 0 ? `còn ${remaining} ký tự` : 'chỉ dùng A–Z, a–z, 0–9' }}
          </p>
        </div>

        <div class="border border-[var(--color-gold)] rounded-lg p-3 bg-[rgba(240,180,41,0.07)]">
          <p class="text-[11px] text-[var(--color-gold)] font-mono tracking-wider mb-1">⚠ KHÔNG RESET ĐƯỢC</p>
          <p class="text-xs text-[var(--color-fg-muted)]">
            Server chỉ lưu hash SHA-256, không lưu raw token. Hãy ghi vào nơi an toàn (1Password, Bitwarden, sổ tay).
          </p>
        </div>

        <p v-if="error" class="text-xs text-[var(--color-rose)] font-mono">{{ error }}</p>

        <div class="flex gap-3">
          <button class="btn-ghost flex-1 py-2.5 px-4 rounded-lg text-sm" :disabled="busy" @click="go('choose')">
            ← Quay lại
          </button>
          <button class="btn-primary flex-1 py-2.5 px-4 rounded-lg text-sm" :disabled="busy || !isValid" @click="handleCreate">
            {{ busy ? 'Đang tạo…' : 'Tạo · vào app →' }}
          </button>
        </div>
      </div>

      <!-- login existing -->
      <div v-else-if="mode === 'login'" class="space-y-4">
        <div>
          <span class="label block mb-2">Nhập token · {{ TOKEN_LENGTH }} ký tự</span>
          <input
            v-model="input"
            type="text"
            spellcheck="false"
            autocomplete="off"
            autocapitalize="off"
            :maxlength="TOKEN_LENGTH"
            class="input-field w-full px-4 py-3 rounded-lg text-lg font-display tracking-[0.25em]"
            placeholder="Token đã có"
            @keyup.enter="handleLogin"
          />
          <p class="mt-1.5 text-[10px] font-mono uppercase tracking-wider text-[var(--color-fg-dim)]">
            {{ remaining > 0 ? `còn ${remaining} ký tự` : 'sẵn sàng' }}
          </p>
        </div>

        <p v-if="error" class="text-xs text-[var(--color-rose)] font-mono">{{ error }}</p>

        <div class="flex gap-3">
          <button class="btn-ghost flex-1 py-2.5 px-4 rounded-lg text-sm" :disabled="busy" @click="go('choose')">
            ← Quay lại
          </button>
          <button class="btn-primary flex-1 py-2.5 px-4 rounded-lg text-sm" :disabled="busy || !isValid" @click="handleLogin">
            {{ busy ? 'Đang xác thực…' : 'Vào app →' }}
          </button>
        </div>
      </div>
    </div>
  </main>
</template>
