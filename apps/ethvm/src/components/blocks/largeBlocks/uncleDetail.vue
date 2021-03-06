<template>
  <v-card class="mt-3 mb-5">
    <v-list dense>
      <template v-for="(item,index) in items">
        <v-list-tile  :key="item.title" class="pl-1 pr-1">
          <v-layout justify-start>
            <v-flex xs4 sm3 md2>
              <v-list-tile-title><strong>{{item.title}}</strong></v-list-tile-title>
            </v-flex>
            <v-flex xs7 sm8 md9>
              <p v-if="!item.link" class="text-muted text-truncate">{{item.detail}}<timeago v-if="item.title == $t('common.timestmp')" :since="block.getTimestamp()" :auto-update="10"></timeago></p>
              <router-link v-else :to="item.link"><p class="text-truncate">{{item.detail}}</p></router-link>
            </v-flex>
            <v-flex xs1>
              <v-list-tile-action v-if="item.copy">
                <copy-to-clip-component :valueToCopy="item.detail"></copy-to-clip-component>
              </v-list-tile-action>
            </v-flex>
          </v-layout>
        </v-list-tile>
        <v-divider class="ma-0" :key="index"></v-divider>
      </template>
      <template v-if="more" v-for="(item,index) in moreItems">
        <v-list-tile  :key="item.title" class="pl-1 pr-1">
          <v-layout justify-start>
            <v-flex xs4 sm3 md2>
              <v-list-tile-title><strong>{{item.title}}</strong></v-list-tile-title>
            </v-flex>
            <v-flex xs7 sm8 md9>
              <p v-if="!item.link" class="text-muted text-truncate">{{item.detail}}</p>
              <router-link v-else :to="item.link"><p class="text-truncate">{{item.detail}}</p></router-link>
            </v-flex>
            <v-flex xs1>
              <v-list-tile-action v-if="item.copy">
                <copy-to-clip-component :valueToCopy="item.detail"></copy-to-clip-component>
              </v-list-tile-action>
            </v-flex>
          </v-layout>
        </v-list-tile>
        <v-divider class="ma-0" :key="(index+1)*10"></v-divider>
      </template>
    </v-list>
    <v-layout justify-end>
      <v-btn v-if="!more" v-on:click="setView()" flat class="trasparent"><v-icon class="fa fa-angle-down black--text"></v-icon></v-btn>
      <v-btn v-else v-on:click="setView()" flat class="trasparent"><v-icon class="fa fa-angle-up black--text"></v-icon></v-btn>
    </v-layout>
  </v-card>
</template>


<script lang="ts">
import { common } from '@app/helpers'
import { Block, Tx } from '@app/models'
import store from '@app/states'
import Vue from 'vue'

export default Vue.extend({
  name: 'BlockView',
  props: ['block', 'uncles'],
  data() {
    return {
      showMore: false,
      items: [],
      moreItems: []
    }
  },
  methods: {
    setView() {
      this.showMore = !this.showMore
    },
    setItems() {
      const newItems = [
        {
          title: this.$i18n.t('block.height'),
          detail: this.block.getNumber()
        },
        {
          title: this.$i18n.t('common.hash'),
          detail: this.block.getHash(),
          copy: true
        },
        {
          title: this.$i18n.t('block.miner'),
          detail: this.block.getMiner(),
          link: '/address/' + this.block.getMiner(),
          copy: true
        },
        {
          title: this.$i18n.t('common.timestmp'),
          detail: this.block.getTimestamp().toString()
        },
        {
          title: this.$i18n.t('block.reward'),
          detail:
            this.block
              .getBlockReward()
              .toEth()
              .toString() +
            ' ' +
            this.$i18n.t('common.eth')
        },
        {
          title: this.$i18n.t('block.pHash'),
          detail: this.block.getParentHash(),
          link: '/block/' + this.block.getParentHash()
        },
        {
          title: this.$i18n.t('block.size'),
          detail: 'TODO'
        }
      ]
      this.items = newItems
    },
    setMore() {
    }
  },
  mounted() {
    this.setItems()
    this.setMore()
  },
  computed: {
    isUncle() {
      return this.block.getIsUncle()
    },
    update() {
      return String
    },
    more() {
      return this.showMore
    }
  }
})
</script>

<style scoped lang="less">
@import '~lessPath/sunil/blocks/largeBlocks/detailComponent.less';
</style>
