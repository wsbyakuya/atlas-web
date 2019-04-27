import axios from '@/libs/api.request'

export const getTableData = () => {
  return axios.request({
    url: 'get_table_data',
    method: 'get'
  })
}

export const getDragList = () => {
  return axios.request({
    url: 'get_drag_list',
    method: 'get'
  })
}

export const errorReq = () => {
  return axios.request({
    url: 'error_url',
    method: 'post'
  })
}

export const saveErrorLogger = info => {
  return axios.request({
    url: 'save_error_logger',
    data: info,
    method: 'post'
  })
}

export const uploadImg = formData => {
  return axios.request({
    url: 'image/upload',
    data: formData
  })
}

export const getOrgData = () => {
  return axios.request({
    url: 'get_org_data',
    method: 'get'
  })
}

export const getTreeSelectData = () => {
  return axios.request({
    url: 'get_tree_select_data',
    method: 'get'
  })
}

export const getAllConfigData = app => {
  return axios.request({
    url: 'api/config/prefix/' + app,
    method: 'get'
  })
}

export const getAllAnnotationData = app => {
  return axios.request({
    url: 'api/annotation/prefix/' + app,
    method: 'get'
  })
}

export const putConfigData = (app, key, value) => {
  return axios.request({
    url: 'api/config/' + app + '/' + key,
    data: 'value=' + encodeURIComponent(value),
    method: 'put',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  })
}

export const putAnnotationData = (app, key, value) => {
  return axios.request({
    url: 'api/annotation/' + app + '/' + key,
    data: 'value=' + encodeURIComponent(value),
    method: 'put',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  })
}

export const deleteConfigData = (app, key) => {
  return axios.request({
    url: 'api/config/' + app + '/' + key,
    method: 'delete'
  })
}

export const deleteAnnotationData = (app, key) => {
  return axios.request({
    url: 'api/annotation/' + app + '/' + key,
    method: 'delete'
  })
}
