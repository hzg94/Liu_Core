<script setup lang="ts">
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import ColumnGroup from 'primevue/columngroup';   // optional
import Row from 'primevue/row';                   // optional
import Select from 'primevue/select';
import InputGroup from 'primevue/inputgroup';
import InputGroupAddon from 'primevue/inputgroupaddon';
import {InputText} from "primevue";
import {ref} from "vue";
import {Breadcrumb} from "primevue";
import Dialog from 'primevue/dialog';
import Button from 'primevue/button';

import {invoke} from "@tauri-apps/api/core";
const tmpFileName = ref({index:-1,name:""})
const dialogVisible = ref(false)
const result = ref({path: "", name: ""})
const path = ref({current_path: "None", files: [{path: "", created: 0, name: "", len: 0}]});


// 菜单
const menus = ref([]);
const rename = ref(false)
const search = ref("None")
var props = defineProps({
  select: String,
});
const select = ref("file")
if (props.select != null && props.select !== "") {
  select.value = props.select
}

async function queryPath() {
  path.value = await invoke("query_path", {path: path.value.current_path});
}

const result_path = defineModel();
const select_row = (row) => {

  if(row.len>0){
    if(select.value==='file') {
      result.value.name=row.name
      result.value.path=row.path
    }else if(select!=='dir'){
      for (let fileType of select.value.toString().split(';')) {
        if(row.name.endsWith(fileType)){
          result.value.name=row.name
          result.value.path=row.path
          break
        }
      }
    }
    return;
  }
  if(select.value==='dir') {
    result.value.name=row.name
    result.value.path=row.path
  }
  path.value.current_path=row.path
  queryPath()

}
const handleClose = (done) => {
  done()
  path.value.current_path = "None";
  result.value = {};
}
const clickResult=(id)=>{
  setTimeout(()=>{
    document.getElementById(id).click()
  },50)
}
const openRename = () => {
  console.log("?")
  setTimeout(()=>{
    rename.value = true
  },50)
}
const breadcrumbItems=()=>{
  let tmp=[]
  for (let string of path.value.current_path.toString().split('\\')) {
    tmp.push(
    {
      label:string,command:(a)=>{
        console.log(a,string);
      }
    });
  }
  return tmp;
}
const cities = ref([
  { name: 'New York', code: 'NY' },
  { name: 'Rome', code: 'RM' },
  { name: 'London', code: 'LDN' },
  { name: 'Istanbul', code: 'IST' },
  { name: 'Paris', code: 'PRS' }
]);
</script>

<template>
  <Button label="打开" plain @click="()=>{
      queryPath()
      dialogVisible = true
    }"/>
  <Dialog
      dismissable-mask
      v-model:visible="dialogVisible"
      title="文件管理"
      modal
      :style="{width:'40rem'}"
      :before-close="handleClose"
  >
    <template #container="{ closeCallback }">
    <div class="p-10">
      <div @click="()=>{
        search='';
        clickResult('search')

      }" @mouseout="()=>{
        search='None'
      }" style="cursor: text;">
        <InputGroup>
          <InputGroupAddon>
            <i class="pi pi-map"></i>
          </InputGroupAddon>
          <Select v-model="search" editable :options="cities" optionLabel="name"  />
        </InputGroup>
      </div>
    <div class="h-80" style="overflow: auto">
      <DataTable  table-style="width: 100%" :value="path.files">
        <!--      <template #header>-->
        <!--        <div class="flex flex-wrap items-center justify-between gap-2">-->
        <!--          <span class="text-xl font-bold">Products</span>-->
        <!--          <Button icon="pi pi-refresh" rounded raised />-->
        <!--        </div>-->
        <!--      </template>-->
        <Column  >
          <template #body="scope">
            <div @click="select_row(scope.data)">
              <template v-if="scope.data.len===0">
                <i class="pi pi-folder"></i>
              </template>
              <template v-else>
                <i class="pi pi-file"></i>
              </template>
            </div>
          </template>
        </Column>
        <Column >
          <template #body="scope">
            <div @click="select_row(scope.data)"
                 style="cursor: pointer;">
              <template v-if="result.name===scope.data.name && rename">
                <el-input size="small" v-model="result.name"></el-input>
              </template>
              <template v-else>
                {{scope.data.name}}
              </template>
            </div>
          </template>
        </Column>
        <Column width="100" >

          <template #body="scope">
            <div @click="select_row(scope)">
              {{
                scope.data.len === 0 ? "" : scope.data.len / 1024 < 1 ? 1 + " KB" : parseInt(scope.data.len / 1024) + 1 + " KB"
              }}
            </div>
          </template>
          <Column width="230" >
            <template #body="scope">
              <div @click="select_row(scope.data)">
                {{ new Date(scope.data).toLocaleString() }}
              </div>
            </template>
          </Column>
        </Column>

      </DataTable>
    </div>


    <div style="padding-top:20px;">
      <InputGroup >
        <InputGroupAddon>
          <template v-if="select!=='dir'">
            <i class="pi pi-file"></i>
          </template>
          <template v-else>
            <i class="pi pi-folder"></i>
          </template>
        </InputGroupAddon>
        <InputText v-model="result.name" placeholder="Price" />
        <InputGroupAddon>

          <Select v-model="search" :options="cities" optionLabel="name" placeholder="Select a City" class="w-full md:w-56" />
<!--          <el-select v-model="select" @change="()=>{-->
<!--              result={path:'',name:''}-->
<!--            }" placeholder="Select" style="width: 115px">-->
<!--            <el-option label="all file" value="file"/>-->
<!--            <el-option label="all dir" value="dir"/>-->
<!--            <template v-if="select!=='file'&&select!=='dir'">-->
<!--              <el-option :label="select" :value="select"/>-->
<!--            </template>-->
<!--          </el-select>-->
        </InputGroupAddon>
      </InputGroup>
    </div>


      <div class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="()=>{
            dialogVisible = false
            result_path=result.path
          }">确认
        </el-button>
      </div>
    </div>
    </template>
  </Dialog>
</template>

<style scoped>

</style>