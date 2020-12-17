<template>
  <div>
    <a-form-model ref="xForm" :model="formData" :rules="rules" v-bind="formCol">
      <a-form-model-item ref="name" label="节点ID" prop="id">
        <a-input v-model="formData.id" />
      </a-form-model-item>
      <a-form-model-item ref="name" label="节点名称" prop="id">
        <a-input v-model="formData.name" />
      </a-form-model-item>
      <a-form-model-item ref="name" label="节点颜色" prop="id">
        <colorPicker v-model="formData.color" />
      </a-form-model-item>
      <a-form-model-item ref="name" label="执行监听器" prop="id">
        <a-badge count="0" show-zero>
          <a-button type="primary" @click="dialogName = 'executionListenerDialog'">编辑</a-button>
        </a-badge>
      </a-form-model-item>
      <a-form-model-item ref="name" label="发起人" prop="id">
        <a-input v-model="formData.initiator" />
      </a-form-model-item>
      <a-form-model-item ref="name" label="表单标识key" prop="id">
        <a-input v-model="formData.formKey" />
      </a-form-model-item>
    </a-form-model>
    <executionListenerDialog
      :dialog-visible="dialogName === 'executionListenerDialog'"
      :element="element"
      :modeler="modeler"
      @close="finishExecutionListener"
    />
  </div>
</template>

<script>
import mixinPanel from '../../common/mixinPanel'
import mixinExecutionListener from '../../common/mixinExecutionListener'
import { commonParse } from '../../common/parseElement'

export default {
  mixins: [mixinPanel, mixinExecutionListener],
  props: {
    formCol: {
      type: Object,
      default: () => {
        return {
          labelCol: { span: 8 },
          wrapperCol: { span: 16 }
        }
      }
    }
  },
  data() {
    return {
      formData: {},
      rules: {
        id: [
          { required: true, message: 'ID不能为空', trigger: 'blur' }
        ]
      }
    }
  },
  computed: {
    formConfig() {
      const _this = this
      return {
        inline: false,
        item: [
          {
            xType: 'input',
            name: 'id',
            label: '节点 id',
            rules: [{ required: true, message: 'Id 不能为空' }]
          },
          {
            xType: 'input',
            name: 'name',
            label: '节点名称'
          },
          {
            xType: 'colorPicker',
            name: 'color',
            label: '节点颜色'
          },
          {
            xType: 'input',
            name: 'documentation',
            label: '节点描述'
          },
          {
            xType: 'slot',
            name: 'executionListener',
            label: '执行监听器'
          },
          {
            xType: 'input',
            name: 'initiator',
            label: '发起人',
            show: !!_this.showConfig.initiator
          },
          {
            xType: 'input',
            name: 'formKey',
            label: '表单标识key',
            show: !!_this.showConfig.formKey
          }
        ]
      }
    }
  },
  watch: {
    'formData.initiator': function(val) {
      if (val === '') val = null
      this.updateProperties({ 'flowable:initiator': val })
    },
    'formData.formKey': function(val) {
      if (val === '') val = null
      this.updateProperties({ 'flowable:formKey': val })
    }
  },
  created() {
    this.formData = commonParse(this.element)
  }
}
</script>

<style>
</style>
