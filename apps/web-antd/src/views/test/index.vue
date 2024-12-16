<script setup lang="ts">
import DaisyuiWrap from '#/components/daisui-wrap.vue';
</script>

<template>
  <div>
    <DaisyuiWrap>
      <ul class="d-menu bg-base-200 d-rounded-box w-56">
        <li><a>Item 1</a></li>
        <li>
          <details open>
            <summary>Parent</summary>
            <ul>
              <li><a>Submenu 1</a></li>
              <li><a>Submenu 2</a></li>
              <li>
                <details open>
                  <summary>Parent</summary>
                  <ul>
                    <li><a>Submenu 1</a></li>
                    <li><a>Submenu 2</a></li>
                  </ul>
                </details>
              </li>
            </ul>
          </details>
        </li>
        <li><a>Item 3</a></li>
      </ul>
    </DaisyuiWrap>
  </div>
</template>
