<template>
  <div>
    <Row>
      <Card>
        <p slot="title">
          <Icon type="android-remove"></Icon>
          ETCD配置表
        </p>
        <Select slot="extra" size="small" style="width:150px" v-model="selectApp" @on-change="getTableData">
          <Option v-for="item in appList" :value="item" :key="item">{{ item }}</Option>
        </Select>
        <Row>
          <Col span="8">
            <Input v-model="searchKey" icon="search" @on-change="handleSearch" placeholder="请输入配置key搜索..." style="width: 240px" />
          </Col>
          <Col span="16">
            <div style="display: flex; justify-content:flex-end;">
              <Poptip confirm title="您确定要清除所有配置？" @on-ok="cleanConfigs">
                <Button icon="md-trash" type="error" style="margin-right: 5px;">清除配置</Button>
              </Poptip>
              <Upload action="" :before-upload="handleBeforeUpload" accept=".xls, .xlsx" :show-upload-list=false>
                <Button icon="ios-cloud-upload-outline" type="info" :loading="exportLoading">导入文件</Button>
              </Upload>
              <Button icon="md-download" type="info" :loading="exportLoading" @click="exportExcel" style="margin-left: 5px;">导出文件</Button>
              <Button shape="circle" icon="md-refresh" type="primary" :loading="tableLoading" style="margin-left: 5px;" @click="getTableData"/>
            </div>
          </Col>
        </Row>
        <Row style="margin-top: 10px;">
          <can-edit-table ref="tables" editable border stripe v-model="tableData" :columns-list="columns" :loading="tableLoading"
          @on-change="handleCellChange"
          @on-delete="handleCellDelete"/>
        </Row>
      </Card>
    </Row>
    <Row style="margin-top: 8px;" v-if="selectApp">
      <Card>
        <Row>
          <Col style="margin-right: 10px;" span="4"><Input v-model="inputKey" placeholder="key"/></Col>
          <Col style="margin-right: 10px;" span="10"><Input v-model="inputValue" placeholder="value" @on-enter="addConfigValue"/></Col>
          <Col style="margin-right: 10px;" span="7"><Input v-model="inputAnnotation" placeholder="说明" @on-enter="addConfigValue"/></Col>
          <Col style="margin-right: 10px;" span="2"><Button type="success" @click="addConfigValue">新增</Button></Col>
        </Row>
      </Card>
    </Row>
  </div>
</template>
<script>
import excel from '@/libs/excel'
import canEditTable from '_c/can-edit-table'
import { getAllConfigData, getAllAnnotationData, putConfigData, putAnnotationData, deleteConfigData, deleteAnnotationData } from '@/api/data'
export default {
  name: 'etcd_config',
  components: {
    canEditTable
  },
  data () {
    return {
      columns: [
        { title: 'Key', key: 'key', align: 'center', width: 220 },
        { title: 'Value', key: 'value', editable: true, align: 'center' },
        { title: 'Annotation', key: 'annotation', editable: true, align: 'center' },
        {
          title: 'Handle',
          key: 'handle',
          align: 'center',
          handle: ['edit', 'delete'],
          width: 200
        }
      ],
      tableData: [],
      originData: [],
      appList: ['a', 'b', 'c', 'open-api'],
      selectApp: 'open-api',
      searchKey: '',
      inputKey: '',
      inputValue: '',
      inputAnnotation: '',
      tableLoading: false,
      uploadLoading: false,
      exportLoading: false,
      showUploadList: false
    }
  },
  methods: {
    handleSearch () {
      this.tableData = this.filterSearch(this.originData)
    },
    filterSearch (data) {
      if (this.searchKey) { return data.filter(d => { return d.key.indexOf(this.searchKey) > -1 }) } else { return data }
    },
    removePrefix (key) {
      if (this.selectApp && key.startsWith(this.selectApp + '/')) {
        key = key.substring((this.selectApp + '/').length)
      }
      return key
    },
    findOriginRow (key) {
      return this.originData.find(d => { return d.key === key })
    },
    handleCellChange (val, index) {
      let originRow = this.findOriginRow(this.tableData[index].key)
      if (!(this.tableData[index].value === originRow.value)) { // 修改了config数据
        putConfigData(this.selectApp, this.tableData[index].key, this.tableData[index].value).then(res => {
          if (res.status === 200) {
            this.$Message.success('修改成功！')
            originRow.value = this.tableData[index].value
          } else {
            this.$Message.success('保存失败！')
          }
        })
      }
      if (!(this.tableData[index].annotation === originRow.annotation)) { // 修改了annotation数据
        putAnnotationData(this.selectApp, this.tableData[index].key, this.tableData[index].annotation).then(res => {
          if (res.status === 200) {
            this.$Message.success('修改成功！')
            originRow.annotation = this.tableData[index].annotation
          } else {
            this.$Message.success('保存失败！')
          }
        })
      }
    },
    handleCellDelete (val, index) {
      let key = this.filterSearch(this.originData)[index].key
      deleteConfigData(this.selectApp, key).then(res => {
        if (res.status === 200) {
          this.$Message.success('删除成功！')
          deleteAnnotationData(this.selectApp, key)
          this.originData = this.originData.filter(d => { return d.key !== key })
        } else {
          this.$Message.success('删除失败！')
        }
      })
    },
    addConfigValue () {
      if (this.originData.some(d => { return this.inputKey === d.key })) {
        this.$Message.error('输入key已存在')
        return
      }
      putConfigData(this.selectApp, this.inputKey, this.inputValue).then(res => {
        if (res.status === 200) {
          putAnnotationData(this.selectApp, this.inputKey, this.inputAnnotation)
          this.$Message.success('添加成功！')
          this.originData.push({ key: this.inputKey, value: this.inputValue, annotation: this.inputAnnotation })
          this.tableData = this.filterSearch(this.originData)
          this.inputKey = ''
          this.inputValue = ''
          this.inputAnnotation = ''
        } else {
          this.$Message.success('添加失败！！')
        }
      })
    },
    getTableData () {
      this.tableLoading = true
      if (this.selectApp) {
        getAllConfigData(this.selectApp).then(res => {
          this.originData = res.data
          getAllAnnotationData(this.selectApp).then(res2 => {
            res2.data.map(d => {
              for (let idx in this.originData) {
                if (d.key === this.originData[idx].key) {
                  this.originData[idx].annotation = d.value
                }
              }
            })
            this.originData.map(d => {
              d.key = this.removePrefix(d.key)
            })
            this.tableData = this.originData
            this.tableLoading = false
          })
        })
      }
    },
    cleanConfigs () {
      this.originData.map(d => {
        deleteConfigData(this.selectApp, d.key).then(res => {
          if (res.status === 200) {
            deleteAnnotationData(this.selectApp, d.key)
          } else {
            this.$Message.success('删除失败！', d)
          }
        })
      })
      this.getTableData()
    },
    exportExcel () {
      if (!this.tableData.length) {
        this.$Message.error('表格数据不能为空！')
        return
      }
      this.exportLoading = true
      const params = {
        title: ['key', 'value', 'annotation'],
        key: ['key', 'value', 'annotation'],
        data: this.tableData,
        filename: this.selectApp + '-ETCD配置表'
      }
      excel.export_array_to_excel(params)
      this.exportLoading = false
    },
    handleBeforeUpload (file) {
      const reader = new FileReader()
      reader.readAsArrayBuffer(file)
      reader.onloadstart = e => {
        this.uploadLoading = true
        this.tableLoading = true
      }
      reader.onprogress = e => {
      }
      reader.onerror = e => {
        this.$Message.error('文件读取出错')
      }
      reader.onload = e => {
        this.$Message.info('文件读取成功')
        const data = e.target.result
        const { header, results } = excel.read(data, 'array')
        if (header.length < 3 || header[0] !== 'key' || header[1] !== 'value' || header[2] !== 'annotation') {
          this.$Message.error('上传文件格式错误')
          return
        }
        results.map(d => {
          putConfigData(this.selectApp, d.key, d.value).then(res => {
            if (res.status === 200) {
              putAnnotationData(this.selectApp, d.key, d.annotation)
              this.originData.push({ key: d.key, value: d.value, annotation: d.annotation })
            } else {
              this.$Message.success('添加失败！！', d)
            }
          })
        })
        this.uploadLoading = false
        this.tableLoading = false
      }
      return false
    }
  },
  mounted () {
    this.getTableData()
  }
}
</script>

<style>

</style>
