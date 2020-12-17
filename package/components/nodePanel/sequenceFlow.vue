<template>
  <div>
    <a-form-model ref="xForm" :model="formData" :rules="rules" v-bind="formCol">
      <a-form-model-item ref="id" label="节点ID" prop="id">
        <a-input v-model="formData.id" />
      </a-form-model-item>
      <a-form-model-item ref="name" label="节点名称" prop="id">
        <a-input v-model="formData.name" />
      </a-form-model-item>
      <a-form-model-item ref="color" label="节点颜色" prop="color">
        <colorPicker v-model="formData.color" :default-color="`#000`" />
      </a-form-model-item>
      <a-form-model-item label="执行监听器">
        <a-badge count="0" show-zero>
          <a-button type="primary" @click="dialogName = 'executionListenerDialog'">编辑</a-button>
        </a-badge>
      </a-form-model-item>
      <a-form-model-item ref="conditionExpression" label="跳转条件" prop="conditionExpression">
        <a-input v-model="formData.conditionExpression" />
      </a-form-model-item>
      <a-form-model-item ref="skipExpression" label="跳过表达式" prop="skipExpression">
        <a-input v-model="formData.skipExpression" />
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
import { commonParse, conditionExpressionParse } from '../../common/parseElement'
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
      rules: {}
    }
  },
  watch: {
    'formData.conditionExpression': function(val) {
      if (val) {
        const newCondition = this.modeler.get('moddle').create('bpmn:FormalExpression', { body: `<![CDATA[${val}]]>` })
        this.updateProperties({ conditionExpression: newCondition })
      } else {
        this.updateProperties({ conditionExpression: null })
      }
    },
    'formData.skipExpression': function(val) {
      if (val === '') val = null
      this.updateProperties({ 'flowable:skipExpression': val })
    }
  },
  created() {
    const cache = commonParse(this.element)
    this.formData = conditionExpressionParse(cache)
  }
}
</script>

<style></style>
