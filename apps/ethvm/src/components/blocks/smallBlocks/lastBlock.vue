<template>
  <block-component :title="blockTitle" :value="latestBlockNumber" :colorType="type" :backType="background"></block-component>
</template>

<script lang="ts">
import Vue from 'vue'
import colors from 'vuetify/es5/util/colors'
import { Events as sEvents } from 'ethvm-common'

export default Vue.extend({
  name: 'ShortDataLastBlock',
  data() {
    return {
      blockTitle: this.$i18n.t('smlBlock.last'),
      type: 'primary white--text',
      background: 'last-block'
    }
  },
  computed: {
    latestBlockNumber() {
      if (!this.$store.getters.getBlocks[0]) {
        return this.$i18n.t('message.load')
      }
      this.$eventHub.$on(sEvents.newBlock, _block => {
        return this.$store.getters.getBlocks[0].getNumber()
      })
      return this.$store.getters.getBlocks[0].getNumber()
    }
  }
})
</script>
