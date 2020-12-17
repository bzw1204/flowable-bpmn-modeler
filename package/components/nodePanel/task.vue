<template>
  <div>
    <a-form-model ref="xForm" :model="formData" v-bind="formCol">
      <a-form-model-item ref="name" label="节点ID" prop="id">
        <a-input v-model="formData.id" />
      </a-form-model-item>
      <a-form-model-item ref="name" label="节点名称" prop="name">
        <a-input v-model="formData.name" />
      </a-form-model-item>
      <a-form-model-item ref="color" label="节点颜色" prop="color">
        <colorPicker v-model="formData.color" />
      </a-form-model-item>
      <a-form-model-item ref="documentation" label="节点描述" prop="documentation">
        <a-input v-model="formData.documentation" />
      </a-form-model-item>
      <a-form-model-item label="执行监听器">
        <a-badge :count="executionListenerLength" show-zero>
          <a-button type="primary" @click="dialogName = 'executionListenerDialog'">编辑</a-button>
        </a-badge>
      </a-form-model-item>
      <a-form-model-item label="任务监听器">
        <a-badge :count="taskListenerLength" show-zero>
          <a-button type="primary" @click="dialogName = 'taskListenerDialog'">编辑</a-button>
        </a-badge>
      </a-form-model-item>
      <a-form-model-item label="多实例">
        <a-button @click="dialogName = 'multiInstanceDialog'">编辑</a-button>
      </a-form-model-item>
      <a-form-model-item label="人员类型">
        <a-select v-model="formData.userType" placeholder="请选择人员类型">
          <a-select-option
            v-for="(item,index) in userTypeOption"
            :key="index"
            :value="item.value"
          >{{ item.label }}</a-select-option>
        </a-select>
      </a-form-model-item>
      <a-form-model-item
        v-if="!!showConfig.assignee && formData.userType === 'assignee'"
        ref="assignee"
        label="指定人员"
        prop="assignee"
      >
        <a-select v-model="formData.assignee">
          <a-select-option
            v-for="(item,index) in users"
            :key="index"
            :value="item.id"
          >{{ item.name }}</a-select-option>
        </a-select>
      </a-form-model-item>
      <a-form-model-item
        v-if="!!showConfig.candidateUsers && formData.userType === 'candidateUsers'"
        ref="candidateUsers"
        label="候选人员"
        prop="candidateUsers"
      >
        <a-select v-model="formData.candidateUsers" mode="multiple">
          <a-select-option
            v-for="(item,index) in users"
            :key="index"
            :value="item.id"
          >{{ item.name }}</a-select-option>
        </a-select>
      </a-form-model-item>

      <a-form-model-item
        v-if="!!showConfig.candidateGroups && formData.userType === 'candidateGroups'"
        ref="candidateGroups"
        label="候选组类型"
        prop="candidateGroups"
      >
        <a-radio-group v-model="formData.fixed" @change="switchFixed">
          <a-radio :value="false">选择</a-radio>
          <a-radio :value="true">表达式</a-radio>
        </a-radio-group>
      </a-form-model-item>
      <a-form-model-item
        v-if="!!showConfig.candidateGroups && formData.userType === 'candidateGroups'"
        ref="candidateGroups"
        label="候选组"
        prop="candidateGroups"
      >
        <a-input v-if="formData.fixed" v-model="formData.candidateGroups" />
        <a-select v-else v-model="formData.candidateGroups" mode="multiple">
          <a-select-option
            v-for="(item,index) in groups"
            :key="index"
            :value="item.id"
          >{{ item.name }}</a-select-option>
        </a-select>
      </a-form-model-item>

      <a-form-model-item ref="formKey" label="表单标识key" prop="formKey">
        <a-input v-model="formData.formKey" />
      </a-form-model-item>
    </a-form-model>

    <executionListenerDialog
      :dialog-visible="dialogName === 'executionListenerDialog'"
      :element="element"
      :modeler="modeler"
      @close="finishExecutionListener"
    />
    <taskListenerDialog
      :dialog-visible="dialogName === 'taskListenerDialog'"
      :element="element"
      :modeler="modeler"
      @close="finishTaskListener"
    />
    <multiInstanceDialog
      :dialog-visiblec="dialogName === 'multiInstanceDialog'"
      :element="element"
      :modeler="modeler"
      @close="finishMultiInstance"
    />
  </div>
</template>

<script>
import mixinPanel from '../../common/mixinPanel'
import executionListenerDialog from './property/executionListener'
import taskListenerDialog from './property/taskListener'
import multiInstanceDialog from './property/multiInstance'
import { commonParse, userTaskParse } from '../../common/parseElement'

export default {
  components: {
    executionListenerDialog,
    taskListenerDialog,
    multiInstanceDialog
  },
  mixins: [mixinPanel],
  props: {
    users: {
      type: Array,
      required: true
    },
    groups: {
      type: Array,
      required: true
    },
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
      fixed: false,
      userTypeOption: [
        { label: '请选择', value: '' },
        { label: '指定人员', value: 'assignee' },
        { label: '候选人员', value: 'candidateUsers' },
        { label: '候选组', value: 'candidateGroups' }
      ],
      userTypeLinkage: '',
      dialogName: '',
      executionListenerLength: 0,
      taskListenerLength: 0,
      hasMultiInstance: false,
      formData: {},
      rules: {}
    }
  },
  watch: {
    'formData.userType': function(val, oldVal) {
      if (oldVal) {
        const types = ['assignee', 'candidateUsers', 'candidateGroups']
        types.forEach(type => {
          delete this.element.businessObject.$attrs[`flowable:${type}`]
          delete this.formData[type]
        })
      }
    },
    'formData.assignee': function(val) {
      if (this.formData.userType !== 'assignee') {
        delete this.element.businessObject.$attrs[`flowable:assignee`]
        return
      }
      this.updateProperties({ 'flowable:assignee': val })
    },
    'formData.candidateUsers': function(val) {
      if (this.formData.userType !== 'candidateUsers') {
        delete this.element.businessObject.$attrs[`flowable:candidateUsers`]
        return
      }
      this.updateProperties({ 'flowable:candidateUsers': val?.join(',') })
    },
    'formData.candidateGroups': function(val) {
      if (this.formData.userType !== 'candidateGroups') {
        delete this.element.businessObject.$attrs[`flowable:candidateGroups`]
        return
      }
      this.updateProperties({ 'flowable:candidateGroups': typeof val === 'object' && val.constructor === Array ? val?.join(',') : val })
    },
    'formData.async': function(val) {
      if (val === '') val = null
      this.updateProperties({ 'flowable:async': true })
    },
    'formData.dueDate': function(val) {
      if (val === '') val = null
      this.updateProperties({ 'flowable:dueDate': val })
    },
    'formData.formKey': function(val) {
      if (val === '') val = null
      this.updateProperties({ 'flowable:formKey': val })
    },
    'formData.priority': function(val) {
      if (val === '') val = null
      this.updateProperties({ 'flowable:priority': val })
    },
    'formData.skipExpression': function(val) {
      if (val === '') val = null
      this.updateProperties({ 'flowable:skipExpression': val })
    },
    'formData.isForCompensation': function(val) {
      if (val === '') val = null
      this.updateProperties({ 'isForCompensation': val })
    },
    'formData.triggerable': function(val) {
      if (val === '') val = null
      this.updateProperties({ 'flowable:triggerable': val })
    },
    'formData.class': function(val) {
      if (val === '') val = null
      this.updateProperties({ 'flowable:class': val })
    },
    'formData.autoStoreVariables': function(val) {
      if (val === '') val = null
      this.updateProperties({ 'flowable:autoStoreVariables': val })
    },
    'formData.exclude': function(val) {
      if (val === '') val = null
      this.updateProperties({ 'flowable:exclude': val })
    },
    'formData.ruleVariablesInput': function(val) {
      if (val === '') val = null
      this.updateProperties({ 'flowable:ruleVariablesInput': val })
    },
    'formData.rules': function(val) {
      if (val === '') val = null
      this.updateProperties({ 'flowable:rules': val })
    },
    'formData.resultVariable': function(val) {
      if (val === '') val = null
      this.updateProperties({ 'flowable:resultVariable': val })
    }
  },
  created() {
    let cache = commonParse(this.element)
    cache = userTaskParse(cache)
    this.formData = cache
    this.computedExecutionListenerLength()
    this.computedTaskListenerLength()
    this.computedHasMultiInstance()
  },
  methods: {
    computedExecutionListenerLength() {
      this.executionListenerLength = this.element.businessObject.extensionElements?.values
        ?.filter(item => item.$type.includes(':executionListener') || item.$type.includes(':ExecutionListener')).length ?? 0
    },
    computedTaskListenerLength() {
      this.taskListenerLength = this.element.businessObject.extensionElements?.values
        ?.filter(item => item.$type.includes(':taskListener') || item.$type.includes(':TaskListener')).length ?? 0
    },
    computedHasMultiInstance() {
      if (this.element.businessObject.multiInstanceLoopCharacteristics) {
        this.hasMultiInstance = true
      } else {
        this.hasMultiInstance = false
      }
    },
    finishExecutionListener() {
      if (this.dialogName === 'executionListenerDialog') {
        this.computedExecutionListenerLength()
      }
      this.dialogName = ''
    },
    finishTaskListener() {
      if (this.dialogName === 'taskListenerDialog') {
        this.computedTaskListenerLength()
      }
      this.dialogName = ''
    },
    finishMultiInstance() {
      if (this.dialogName === 'multiInstanceDialog') {
        this.computedHasMultiInstance()
      }
      this.dialogName = ''
    },
    switchFixed() {
      if (!this.formData.fixed) {
        this.formData._temp = this.formData.candidateGroups
      }
      this.formData.candidateGroups = this.formData.fixed ? this.formData._temp : []
    }
  }
}
</script>
