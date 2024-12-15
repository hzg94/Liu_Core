<script setup lang="ts">
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import InputGroup from 'primevue/inputgroup';
import InputGroupAddon from 'primevue/inputgroupaddon';
import {InputText} from "primevue";
import {ref} from "vue";
import {Breadcrumb} from "primevue";
import Dialog from 'primevue/dialog';
import Button from 'primevue/button';
import {invoke} from "@tauri-apps/api/core";
const dialogVisible = ref(false)
const result = ref({path: "", name: ""})
const path = ref({current_path: "None", files: [{path: "", created: 0, name: "", len: 0}]});
const cm = ref();
const selectedProduct = ref();
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
const select_row = (row:any) => {

  if(row.len>0){
    if(select.value==='file') {
      result.value.name=row.name
      result.value.path=row.path
    }else if(select.value!=='dir'){
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
const menuModel = ref([
  {label: 'View', icon: 'pi pi-fw pi-search', command: () => {console.log(selectedProduct.value.name)}},
  {label: 'Delete', icon: 'pi pi-fw pi-times', command: () => {console.log(selectedProduct.value.name)}}
]);
const handleClose = (done:any) => {
  done()
  path.value.current_path = "None";
  result.value = {path: "", name: ""};
}
const clickResult=(id:string)=>{
  setTimeout(()=>{
    (document.getElementById(id) as HTMLElement).click()
  },50)
}
const breadcrumbItems=()=>{
  let tmp=[]
  for (let string of path.value.current_path.toString().split('\\')) {
    tmp.push({
      label:string,
      command:()=>{
        let tmp_srt = ""
        let split = path.value.current_path.toString().split('\\');
        for (let i = 0; i < split.length-1; i++) {
          tmp_srt=tmp_srt+"\\"+split[i]
          if (string===split[i]){
            path.value.current_path=tmp_srt.slice(1)
            queryPath()
          }
        }
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
const onRowContextMenu = (event:any) => {
  cm.value.show(event.originalEvent);
};
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
    <template #container>
    <div class="p-10">
      <div style="cursor: text;">
          <InputGroup>
            <InputGroupAddon class="!bg-stone-100">
                <i class="pl-2 pi pi-angle-left cursor-pointer text-blue-500"/>
                <i class="pl-2 pr-2 pi pi-angle-right cursor-pointer "/>
            </InputGroupAddon>

              <template v-if="search==='None'">
                <InputGroupAddon>
                  <div class="w-screen">
                    <Breadcrumb id="breadcrumb" style="padding:0" :model="breadcrumbItems() " >
                      <template #separator>\</template>
                    </Breadcrumb>
                  </div>
                </InputGroupAddon>
              </template>
              <template v-else>
                  <Select v-model="search" editable :options="cities" optionLabel="name"  />
              </template>
          </InputGroup>

      </div>
      <div class="h-2"/>
    <ContextMenu ref="cm" :model="menuModel" @hide="selectedProduct = null" />
    <div class=" h-80 overflow-auto " >
      <DataTable  table-style="width: 100%" contextMenu
                  v-model:contextMenuSelection="selectedProduct"
                  @rowContextmenu="onRowContextMenu"
                  :value="path.files">
        <Column  :pt="{headerCell:{class:'!p-0'}}" body-class="!p-0" body-style="width:10px">
          <template #body="scope">
            <div   @click="select_row(scope.data)">
              <template v-if="scope.data.len===0">
                <i class="pi pi-folder block pl-4"></i>
              </template>
              <template v-else>
                <i class="pi pi-file block pl-4"></i>
              </template>
            </div>
          </template>
        </Column>
        <Column :pt="{headerCell:{class:'!p-0'}}" body-class="p-0!" >
          <template #body="scope">
            <div @click="select_row(scope.data)"
                 style="cursor: pointer;">
              <template v-if="result.name===scope.data.name && rename">
              </template>
              <template v-else>
                {{scope.data.name}}
              </template>
            </div>
          </template>
        </Column>
        <Column :pt="{headerCell:{class:'!p-0'}}" body-class="w-24 !text-right">
          <template #body="scope">
            <div @click="select_row(scope)">
              {{
                scope.data.len === 0 ? "" : scope.data.len / 1024 < 1 ? (1).toString() + " KB" : (parseInt((scope.data.len / 1024).toString()) + 1 ).toString()+ " KB"
              }}
            </div>
          </template>
        </Column>
        <Column :pt="{headerCell:{class:'!p-0'}}" body-class="w-44 !text-right !p-0" >
          <template #body="scope">
            <div @click="select_row(scope)">
              {{ new Date(scope.data.created).toLocaleString() }}
            </div>
          </template>
        </Column>
      </DataTable>
    </div>


    <div class="pt-5 h-10">
      <InputGroup >
        <InputGroupAddon class="!bg-stone-100">
          <div class="pr-2 pl-2.5 ">
            <template v-if="select!=='dir'">
              <i class="pi pi-file"></i>
            </template>
            <template v-else>
              <i class="pi pi-folder"></i>
            </template>
          </div>
        </InputGroupAddon >
        <InputText v-model="result.name"  />
        <InputGroupAddon class="!bg-stone-100">
          <div class="w-24 text-center  ">
             {{select}}
          </div>
<!--          <Select v-model="search" :options="cities" optionLabel="name" placeholder="Select a City" class="w-full md:w-56" />-->
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


    </div>
      <div class="pl-96">
        <Button size="small" @click="()=>{
          dialogVisible = false
          // closeCallback()
        } ">取消</Button>

        <Button size="small" type="primary" @click="()=>{
            dialogVisible = false
            result_path=result.path
          }">确认
        </Button>
      </div>
    </template>
  </Dialog>
</template>

<style scoped>
</style>
