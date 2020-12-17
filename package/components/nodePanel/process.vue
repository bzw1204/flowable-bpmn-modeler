<template>
  <div>
    <a-form-model ref="xForm" :model="formData" :rules="rules" :label-col="labelCol" :wrapper-col="wrapperCol">
      <a-form-model-item ref="id" label="流程标识key" prop="id">
        <a-input v-model="formData.id" />
      </a-form-model-item>
      <a-form-model-item ref="name" label="流程名称" prop="name">
        <a-input v-model="formData.name" />
      </a-form-model-item>
      <a-form-model-item ref="documentation" label="流程描述" prop="documentation">
        <a-input v-model="formData.documentation" />
      </a-form-model-item>
      <a-form-model-item ref="" label="执行监听器">
        <a-badge :count="executionListenerLength" show-zero>
          <a-button type="primary" @click="dialogName = 'executionListenerDialog'">编辑</a-button>
        </a-badge>
      </a-form-model-item>
      <a-form-model-item label="信号定义">
        <a-badge :count="signalLength" show-zero>
          <a-button type="primary" @click="dialogName = 'signalDialog'">编辑</a-button>
        </a-badge>
      </a-form-model-item>
    </a-form-model>

    <!-- 执行监听器弹窗 -->
    <executionListenerDialog
      v-if="dialogName === 'executionListenerDialog'"
      :element="element"
      :modeler="modeler"
      @close="finishExecutionListener"
    />
    <!--信号定义弹窗-->
    <signalDialog
      v-if="dialogName === 'signalDialog'"
      :element="element"
      :modeler="modeler"
      @close="finishExecutionListener"
    />
  </div>
</template>

<script>
import mixinPanel from '../../common/mixinPanel'
import mixinExecutionListener from '../../common/mixinExecutionListener'
import signalDialog from './property/signal'
import { commonParse } from '../../common/parseElement'

export default {
  components: {
    signalDialog
  },
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
      labelCol: { span: 8 },
      wrapperCol: { span: 16 },
      signalLength: 0,
      formData: {},
      rules: {
        id: [{ required: true, message: 'ID 不能为空', trigger: 'blur' }]
      }
    }
  },
  created() {
    this.formData = commonParse(this.element)
  },
  methods: {
    computedSignalLength() {
      this.signalLength = this.element.businessObject.extensionElements?.values?.length ?? 0
    },
    finishSignal() {
      if (this.dialogName === 'signalDialog') {
        this.computedSignalLength()
      }
      this.dialogName = ''
    }
  }
}
</script>

<style>

</style>
