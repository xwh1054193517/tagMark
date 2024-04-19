<template>
    <canvas 
    :id="props.canvasId" 
    :width="props.width" 
    :height="props.height">
    </canvas>
    <div class="btn-wrarpper">
        <button @click="toggleScales">缩放功能：{{ toggleScale?'开启':'关闭' }}</button>
        <button @click="toggleTags">标注功能：{{ toggleTag?'开启':'关闭' }}</button>
        <button></button>
        <button></button>
        <button></button>
    </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import {TagMarkTools, markOptions} from '../core/index'
    const props=defineProps({
        canvasId:{
            type:String,
            default:'tagMark'
        },
        width:{
            type:Number,
            default:1000
        },
        height:{
            type:Number,
            default:1000
        },
        imgUrl:{
            type:String,
            default:''
        }
    })
    const options:markOptions={...props}
    let tagTool=ref(null) as any
    let toggleScale=ref(true)
    let toggleTag=ref(true)
    const toggleScales=()=>{
        tagTool.value&&tagTool.value.toggleWheel()
        toggleScale.value=!toggleScale.value
    }
    const toggleTags=()=>{
        tagTool.value&&tagTool.value.toggleTags()
        toggleTag.value=!toggleTag.value
    }
    onMounted(()=>{
        tagTool.value=new TagMarkTools(options)
    })
    
</script>
<style>
    canvas{
        border: 1px solid red
    }
</style>