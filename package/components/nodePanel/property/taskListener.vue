<template>
  <div>
    <a-drawer
      title="任务监听器"
      width="700px"
      placement="right"
      :closable="false"
      :visible="dialogVisible"
      @close="$emit('close')"
    >
      <div style="padding: 10px 0;">
        <a-button type="primary" @click="handleInsert">新增</a-button>
      </div>
      <a-table
        :columns="columns"
        :data-source="formData.taskListener"
        bordered
        size="small"
        :row-key="(record,index) =>index"
      >
        <span slot="customTitle">
          <a-popover placement="bottom" arrow-point-at-center>
            <a-space>
              事件
              <a-icon type="info-circle" />
            </a-space>
            <template slot="content">
              <p>create（创建）：当任务已经创建，并且所有任务参数都已经设置时触发。</p>
              <p>assignment（指派）：当任务已经指派给某人时触发。请注意：当流程执行到达用户任务时，在触发create事件之前，会首先触发assignment事件。</p>
              <p>complete（完成）：当任务已经完成，从运行时数据中删除前触发。</p>
              <p>delete（删除）：在任务即将被删除前触发。请注意任务由completeTask正常完成时也会触发。</p>
            </template>
          </a-popover>
        </span>
        <template slot="params" slot-scope="text,record,index">
          <a-badge :count="text ? text.length : 0" show-zero>
            <a-button type="primary" size="small" @click="configParam(index)">配置</a-button>
          </a-badge>
        </template>
        <template slot="operation">
          <a-popconfirm title="确定删除吗?">
            <a-button type="link" icon="delete" />
          </a-popconfirm>
        </template>
      </a-table>
    </a-drawer>
    <listenerParam
      v-if="showParamDialog"
      :value="formData.taskListener[nowIndex].params"
      @close="finishConfigParam"
    />
  </div>
</template>

<script>
import mixinPanel from '../../../common/mixinPanel'
import listenerParam from './listenerParam'

export default {
  components: { listenerParam },
  mixins: [mixinPanel],
  props: {
    dialogVisible: {
      type: Boolean,
      default: () => false
    }
  },
  data() {
    return {
      showParamDialog: false,
      nowIndex: null,
      formData: {
        taskListener: []
      },
      columns: [
        {
          dataIndex: 'event',
          slots: { title: 'customTitle' }
        },
        {
          title: '类型',
          dataIndex: 'type'
        },
        {
          title: 'Java类名',
          dataIndex: 'className',
          width: '40%'
        },
        {
          title: '参数',
          dataIndex: 'params',
          scopedSlots: { customRender: 'params' }
        },
        {
          title: '操作',
          dataIndex: 'operation',
          scopedSlots: { customRender: 'operation' }
        }
      ]
    }
  },
  computed: {
    formConfig() {
      //   const _this = this
      return {
        inline: false,
        item: [
          {
            xType: 'tabs',
            tabs: [
              {
                label: '任务监听器',
                name: 'taskListener',
                column: [
                  {
                    label: '事件',
                    name: 'event',
                    width: 180,
                    rules: [{ required: true, message: '请选择', trigger: ['blur', 'change'] }],
                    xType: 'select',
                    dic: [
                      { label: 'create', value: 'create' },
                      { label: 'assignment', value: 'assignment' },
                      { label: 'complete', value: 'complete' },
                      { label: 'delete', value: 'delete' }
                    ],
                    tooltip: ''
                  },
                  {
                    label: '类型',
                    name: 'type',
                    width: 180,
                    rules: [{ required: true, message: '请选择', trigger: ['blur', 'change'] }],
                    xType: 'select',
                    dic: [
                      { label: '类', value: 'class' },
                      { label: '表达式', value: 'expression' },
                      { label: '委托表达式', value: 'delegateExpression' }
                    ]
                  },
                  {
                    label: 'java 类名',
                    name: 'className',
                    xType: 'input',
                    rules: [{ required: true, message: '请输入', trigger: ['blur', 'change'] }]
                  },
                  {
                    xType: 'slot',
                    label: '参数',
                    width: 120,
                    slot: true,
                    name: 'params'
                  }
                ]
              }
            ]
          }
        ]
      }
    }
  },
  mounted() {
    this.formData.taskListener = this.element.businessObject.extensionElements?.values
      .filter(item => item.$type.includes(':TaskListener') || item.$type.includes(':taskListener'))
      .map(item => {
        let type
        if ('class' in item) type = 'class'
        if ('expression' in item) type = 'expression'
        if ('delegateExpression' in item) type = 'delegateExpression'
        return {
          event: item.event,
          type: type,
          className: item[type],
          params: item.fields?.map(field => {
            let fieldType
            if ('stringValue' in field) fieldType = 'stringValue'
            if ('expression' in field) fieldType = 'expression'
            return {
              name: field.name,
              type: fieldType,
              value: field[fieldType]
            }
          }) ?? []
        }
      }) ?? []
  },
  methods: {
    handleInsert() {
    },
    configParam(index) {
      this.nowIndex = index
      const nowObj = this.formData.taskListener[index]
      if (!nowObj.params) {
        nowObj.params = []
      }
      this.showParamDialog = true
    },
    finishConfigParam(param) {
      this.showParamDialog = false
      // hack 数量不更新问题
      const cache = this.formData.taskListener[this.nowIndex]
      cache.params = param
      this.$set(this.formData.taskListener[this.nowIndex], this.nowIndex, cache)
      this.nowIndex = null
    },
    updateElement() {
      if (this.formData.taskListener?.length) {
        let extensionElements = this.element.businessObject.get('extensionElements')
        if (!extensionElements) {
          extensionElements = this.modeler.get('moddle').create('bpmn:ExtensionElements')
        }
        // 清除旧值
        extensionElements.values = extensionElements.values?.filter(item => item.$type !== 'flowable:TaskListener') ?? []
        this.formData.taskListener.forEach(item => {
          const taskListener = this.modeler.get('moddle').create('flowable:TaskListener')
          taskListener['event'] = item.event
          taskListener[item.type] = item.className
          if (item.params && item.params.length) {
            item.params.forEach(field => {
              const fieldElement = this.modeler.get('moddle').create('flowable:Field')
              fieldElement['name'] = field.name
              fieldElement[field.type] = field.value
              // 注意：flowable.json 中定义的string和expression类为小写，不然会和原生的String类冲突，此处为hack
              // const valueElement = this.modeler.get('moddle').create(`flowable:${field.type}`, { body: `<![CDATA[${field.value}]]>` })
              // fieldElement[field.type] = valueElement
              taskListener.get('fields').push(fieldElement)
            })
          }
          extensionElements.get('values').push(taskListener)
        })
        this.updateProperties({ extensionElements: extensionElements })
      } else {
        const extensionElements = this.element.businessObject[`extensionElements`]
        if (extensionElements) {
          extensionElements.values = extensionElements.values?.filter(item => item.$type !== 'flowable:TaskListener') ?? []
        }
      }
    },
    closeDialog() {
      this.$refs.xForm.validate().then(() => {
        this.updateElement()
        this.dialogVisible = false
      }).catch(e => console.error(e))
    }
  }
}
</script>

<style>
</style>
