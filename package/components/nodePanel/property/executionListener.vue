<template>
  <div>
    <a-drawer
      title="执行监听器"
      width="700px"
      placement="right"
      :closable="false"
      :visible="dialogVisible"
      @close="$emit('close')"
    >
      <a-table
        :columns="columns"
        :data-source="formData.executionListener"
        bordered
        size="small"
        :row-key="(record,index)=>index"
      >
        <span slot="customTitle">
          <a-popover placement="bottom" arrow-point-at-center>
            <a-space>
              类型
              <a-icon type="info-circle" />
            </a-space>
            <template slot="content">
              <p>类：示例 com.company.MyCustomListener，自定义类必须实现 org.flowable.engine.delegate.TaskListener 接口</p>
              <p>表达式：示例 ${myObject.callMethod(task, task.eventName)}</p>
              <p>委托表达式：示例 ${myListenerSpringBean} ，该 springBean 需要实现 org.flowable.engine.delegate.TaskListener 接口</p>
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
      :value="formData.executionListener[nowIndex].params"
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
        executionListener: []
      },
      columns: [
        {
          title: '事件',
          dataIndex: 'event'
        },
        {
          dataIndex: 'type',
          slots: { title: 'customTitle' }
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
                label: '执行监听器',
                name: 'executionListener',
                column: [
                  {
                    label: '事件',
                    name: 'event',
                    width: 180,
                    rules: [{ required: true, message: '请选择', trigger: ['blur', 'change'] }],
                    xType: 'select',
                    dic: [
                      { label: 'start', value: 'start' },
                      { label: 'end', value: 'end' },
                      { label: 'take', value: 'take' }
                    ]
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
                    ],
                    tooltip: ''
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
    if (this.element) {
      this.formData.executionListener = this.element.businessObject.extensionElements?.values
        .filter(item => item.$type.includes(':ExecutionListener') || item.$type.includes(':executionListener'))
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
    }
    console.log(this.formData.executionListener)
  },
  methods: {
    configParam(index) {
      this.nowIndex = index
      const nowObj = this.formData.executionListener[index]
      if (!nowObj.params) {
        nowObj.params = []
      }
      this.showParamDialog = true
    },
    finishConfigParam(param) {
      this.showParamDialog = false
      // hack 数量不更新问题
      const cache = this.formData.executionListener[this.nowIndex]
      cache.params = param
      this.$set(this.formData.executionListener[this.nowIndex], this.nowIndex, cache)
      this.nowIndex = null
    },
    updateElement() {
      if (this.formData.executionListener?.length) {
        let extensionElements = this.element.businessObject.get('extensionElements')
        if (!extensionElements) {
          extensionElements = this.modeler.get('moddle').create('bpmn:ExtensionElements')
        }
        // 清除旧值
        extensionElements.values = extensionElements.values?.filter(item => item.$type !== 'flowable:ExecutionListener') ?? []
        this.formData.executionListener.forEach(item => {
          const executionListener = this.modeler.get('moddle').create('flowable:ExecutionListener')
          executionListener['event'] = item.event
          executionListener[item.type] = item.className
          if (item.params && item.params.length) {
            item.params.forEach(field => {
              const fieldElement = this.modeler.get('moddle').create('flowable:Field')
              fieldElement['name'] = field.name
              fieldElement[field.type] = field.value
              // 注意：flowable.json 中定义的string和expression类为小写，不然会和原生的String类冲突，此处为hack
              // const valueElement = this.modeler.get('moddle').create(`flowable:${field.type}`, { body: `<![CDATA[${field.value}]]>` })
              // fieldElement[field.type] = valueElement
              executionListener.get('fields').push(fieldElement)
            })
          }
          extensionElements.get('values').push(executionListener)
        })
        this.updateProperties({ extensionElements: extensionElements })
      } else {
        const extensionElements = this.element.businessObject[`extensionElements`]
        if (extensionElements) {
          extensionElements.values = extensionElements.values?.filter(item => item.$type !== 'flowable:ExecutionListener') ?? []
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
.flow-containers .el-badge__content.is-fixed {
  top: 18px;
}
</style>
