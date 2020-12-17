<template>
  <div class="multi-instance">
    <a-modal
      title="多实例配置"
      width="500px"
      :visible="dialogVisible"
      @cancel="$emit('close')"
    >
      <a-alert type="info" style="margin-bottom: 20px">
        <template slot="description">
          按照BPMN2.0规范的要求，用于为每个实例创建执行的父执行，会提供下列变量:<br>
          nrOfInstances：实例总数。<br>
          nrOfActiveInstances：当前活动的（即未完成的），实例数量。对于顺序多实例，这个值总为1。<br>
          nrOfCompletedInstances：已完成的实例数量。<br>
          loopCounter：给定实例在for-each循环中的index。<br>
        </template>
      </a-alert>
      <a-form-model ref="xForm" :model="formData" :rules="rules" v-bind="formCol">
        <a-form-model-item ref="collection" prop="collection">
          <template slot="label">
            <a-space>
              集合
              <a-tooltip placement="topLeft">
                <template slot="title">
                  属性会作为表达式进行解析。如果表达式解析为字符串而不是一个集合，<br>不论是因为本身配置的就是静态字符串值，还是表达式计算结果为字符串，<br>这个字符串都会被当做变量名，并从流程变量中用于获取实际的集合。
                </template>
                <a-icon type="info-circle" theme="twoTone" />
              </a-tooltip>
            </a-space>
          </template>
          <a-input v-model="formData.collection" />
        </a-form-model-item>
        <a-form-model-item ref="elementVariable" prop="elementVariable">
          <template slot="label">
            <a-space>
              元素变量
              <a-tooltip placement="topLeft">
                <template slot="title">
                  每创建一个用户任务前，先以该元素变量为label，集合中的一项为value，<br>创建（局部）流程变量，该局部流程变量被用于指派用户任务。<br>一般来说，该字符串应与指定人员变量相同。
                </template>
                <a-icon type="info-circle" theme="twoTone" />
              </a-tooltip>
            </a-space>
          </template>
          <a-input v-model="formData.elementVariable" />
        </a-form-model-item>
        <a-form-model-item ref="isSequential" label="执行方式" prop="isSequential">
          <a-radio-group v-model="formData.isSequential">
            <a-radio :value="false">并行</a-radio>
            <a-radio :value="true">串行</a-radio>
          </a-radio-group>
        </a-form-model-item>
        <a-form-model-item ref="completionCondition" prop="completionCondition">
          <template slot="label">
            <a-space>
              完成条件
              <a-tooltip placement="topLeft">
                <template slot="title">
                  多实例活动在所有实例都完成时结束，然而也可以指定一个表达式，在每个实例<br>结束时进行计算。当表达式计算为true时，将销毁所有剩余的实例，并结束多实例<br>活动，继续执行流程。例如 ${nrOfCompletedInstances/nrOfInstances >= 0.6 }，<br>表示当任务完成60%时，该节点就算完成
                </template>
                <a-icon type="info-circle" theme="twoTone" />
              </a-tooltip>
            </a-space>
          </template>
          <a-input v-model="formData.completionCondition" />
        </a-form-model-item>
      </a-form-model>
    </a-modal>
  </div>
</template>

<script>
import mixinPanel from '../../../common/mixinPanel'

export default {
  mixins: [mixinPanel],
  props: {
    dialogVisible: {
      type: Boolean,
      default: () => false
    },
    formCol: {
      type: Object,
      default: () => {
        return {
          labelCol: { span: 6 },
          wrapperCol: { span: 18 }
        }
      }
    }
  },
  data() {
    return {
      formData: {
        collection: '',
        elementVariable: '',
        isSequential: false,
        completionCondition: ''
      },
      rules: {}
    }
  },
  mounted() {
    const cache = JSON.parse(JSON.stringify(this.element.businessObject.multiInstanceLoopCharacteristics?.$attrs ?? {}))
    cache.completionCondition = this.element.businessObject.multiInstanceLoopCharacteristics?.completionCondition?.body
    // 移除flowable前缀，格式化数组
    for (const key in cache) {
      if (key.indexOf('flowable:') === 0) {
        const newKey = key.replace('flowable:', '')
        cache[newKey] = cache[key]
        delete cache[key]
      }
    }
    this.formData = cache
  },
  methods: {
    updateElement() {
      if (this.formData.isSequential) {
        let multiInstanceLoopCharacteristics = this.element.businessObject.get('multiInstanceLoopCharacteristics')
        if (!multiInstanceLoopCharacteristics) {
          multiInstanceLoopCharacteristics = this.modeler.get('moddle').create('bpmn:MultiInstanceLoopCharacteristics')
        }
        multiInstanceLoopCharacteristics.$attrs['isSequential'] = this.formData.isSequential
        multiInstanceLoopCharacteristics.$attrs['flowable:collection'] = this.formData.collection
        multiInstanceLoopCharacteristics.$attrs['flowable:elementVariable'] = this.formData.elementVariable
        if (this.formData.completionCondition) {
          const completionCondition = this.modeler.get('moddle').create('bpmn:Expression', { body: this.formData.completionCondition })
          multiInstanceLoopCharacteristics['completionCondition'] = completionCondition
        }
        this.updateProperties({ multiInstanceLoopCharacteristics: multiInstanceLoopCharacteristics })
      } else {
        delete this.element.businessObject.multiInstanceLoopCharacteristics
      }
    },
    save() {
      this.updateElement()
      this.dialogVisible = false
    }
  }
}
</script>

<style lang="scss">
.multi-instance {
  .ant-alert-description {
    font-size: 12px;
    font-weight: bold;
  }

  .ant-modal-body {
    padding-bottom: 0;

    .ant-form {
      padding: 24px !important;
      padding-bottom: 0 !important;
    }
  }

}
</style>
