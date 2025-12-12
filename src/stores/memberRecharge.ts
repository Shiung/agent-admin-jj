import { ref } from 'vue'
import { defineStore } from 'pinia'
import API from '@/apis'
import type { WhatsAppGroupListQuery, WhatsAppGroupListResponseData } from '@/apis/codegen/data-contracts'

export const useMemberRechargeStore = defineStore('memberRecharge', () => {
  /** WhatsApp群組, 從 雲平台 > 代理管理 > 代理列表 > WhatsApp群組設置 來的 */
  const whatsAppGroupList = ref<WhatsAppGroupListResponseData['Items']>([])

  const fetchWhatsAppGroupList = async (params: WhatsAppGroupListQuery) => {
    const res = await API.memberRecharge.getWhatsAppGroupList(params)
    if (res.data.Code !== 200) return
    whatsAppGroupList.value = res.data.Data.Items
  }

  return {
    whatsAppGroupList,
    fetchWhatsAppGroupList
  }
})