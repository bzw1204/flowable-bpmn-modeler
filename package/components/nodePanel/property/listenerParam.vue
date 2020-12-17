<template>
  <div>
    <a-drawer
      title="监听器参数"
      width="700px"
      placement="right"
      :closable="false"
      :visible="dialogVisible"
      @close="$emit('close', formData.paramList)"
    >
      <div style="padding: 10px 0;">
        <a-button type="primary" @click="handleInsert">新增</a-button>
      </div>
      <a-table :columns="columns" :data-source="formData.paramList" bordered size="small">
        <template slot="operation">
          <a-popconfirm title="确定删除吗?">
            <a-button type="link" icon="delete" />
          </a-popconfirm>
        </template>
      </a-table>
    </a-drawer>
  </div>
</template>

<script>

export default {
  props: {
    value: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      dialogVisible: true,
      formData: {
        paramList: this.value
      },
      columns: [
        {
          title: '类型',
          dataIndex: 'type'
        },
        {
          title: '名称',
          dataIndex: 'name'
        },
        {
          title: '值',
          dataIndex: 'value',
          width: '40%'
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
      return {
        inline: false,
        item: [
          {
            xType: 'tabs',
            tabs: [
              {
                label: '监听器参数',
                name: 'paramList',
                column: [
                  {
                    label: '类型',
                    name: 'type',
                    width: 180,
                    rules: [{ required: true, message: '请选择', trigger: ['blur', 'change'] }],
                    xType: 'select',
                    dic: [
                      { label: '字符串', value: 'stringValue' },
                      { label: '表达式', value: 'expression' }
                    ]
                  },
                  {
                    label: '名称',
                    name: 'name',
                    width: 180,
                    rules: [{ required: true, message: '请选择', trigger: ['blur', 'change'] }],
                    xType: 'input'
                  },
                  {
                    label: '值',
                    name: 'value',
                    xType: 'input',
                    rules: [{ required: true, message: '请输入', trigger: ['blur', 'change'] }]
                  }
                ]
              }
            ]
          }
        ]
      }
    }
  },
  methods: {
    handleInsert() {
    },
    closeDialog() {
      this.$refs.xForm.validate().then(() => {
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
