<script setup lang="ts">
import { ref } from 'vue'
const showInfo = ref<boolean>(false)

const findMember = ref<boolean>(false)

</script>

<template>
  <div class="space-y-2 px-4">
    <NavBar title="调线申请">
      <template #right>
        <router-link :to="{ name: 'manageMemberBelongRecord' }">
          <van-icon name="todo-list-o" size="25" color="var(--color-neutral2-secondary)" />
        </router-link>
      </template>
    </NavBar>

    <div class="flex justify-between items-center bg-bg-floor-1-2 rounded-full py-2 px-3"  @click="showInfo = true">
      <div class="flex items-center space-x-2">
        <van-image class="w-5" fit="contain" src="./static/images/manage/lightBulb.png" />
        <span class="text-sm font-semibold text-primary-normal">何谓调线申请？</span>
      </div>
      <van-icon name="arrow" color="var(--color-primary-normal)" />
    </div>

    <app-field :disabled="findMember ? true : false">
      <template #label>
        <span>会员账号<span class="text-sm text-error-normal">*</span></span>
      </template>
    </app-field>

    <app-field :disabled="findMember ? true : false">
      <template #label>
        <span>产品包<span class="text-sm text-error-normal">*</span></span>
      </template>
    </app-field>

    <template v-if="findMember">
      <div class="w-full flex justify-end">
        <van-button type="primary" round plain size="small" class="px-4!">重置</van-button>
      </div>
      <app-field>
        <template #label>
          <span>绑定渠道号<span class="text-sm text-error-normal">*</span></span>
        </template>
      </app-field>
      <app-field>
        <template #label>
          <span>引导链接<span class="text-sm text-error-normal">*</span></span>
        </template>
      </app-field>
      <app-field>
        <template #label>
          <span>设备类型<span class="text-sm text-error-normal">*</span></span>
        </template>
      </app-field>
      <app-field type="textarea">
        <template #label>
          <span>备注<span class="text-sm text-error-normal">*</span></span>
        </template>
      </app-field>
    </template>

    <van-button class="w-full" type="primary" round disabled >
      {{ findMember ? '会员查询' : '调线申请' }}
    </van-button>

  </div>
  <van-popup v-model:show="showInfo" round position="bottom" closeable close-icon="close">
    <div class="p-4 flex items-center justify-center text-lg font-semibold text-neutral2-basic">何谓调线申请？</div>
    <div class="p-4 pb-20 text-sm font-normal text-neutral2-secondary">
      <p>什么是调线申请？</p>
      <p>调线的申请条件是一种找回下级会员的方法，代理可通过此功能可以找回没能顺利通过推广链接注册成为下级的会员用户。</p>
      <p class="mt-3">
        申请限制：
      </p>
      <p>只能找回三天时间内通过自身推广链接注册的下级会员</p>
    </div>
  </van-popup>
</template>