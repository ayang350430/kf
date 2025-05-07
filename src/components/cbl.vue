<template>
  <div>
    <div class="sidebar">
      <div class="sidebar-item">
        <div class="icon user-icon"></div>
      </div>
      <div class="sidebar-item">
        <div class="icon message-icon"></div>
      </div>
      <div class="sidebar-item">
        <div class="icon group-icon"></div>
      </div>
      <div class="sidebar-item">
        <div class="icon share-icon"></div>
      </div>
      <div class="sidebar-item">
        <div class="icon settings-icon"></div>
      </div>
      <div class="sidebar-item">
        <div class="icon chat-icon"></div>
      </div>
    </div>
  </div>
</template>

<script setup>

</script>

<style scoped lang="scss">
.sidebar {
  width: 80px;
  height: 100vh;
  background-color: #52bfff;
  display: flex;
  flex-direction: column;
  align-items: center;
  // padding: 20px 0;
  box-sizing: border-box;
}

.sidebar-item {
  width: 40px;
  height: 40px;
  margin: 20px 0;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
}

.icon {
  width: 40px;
  height: 40px;
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
}

.user-icon {
  background-image: url('../assets/user.png');
}

.message-icon {
  background-image: url('../assets/message.png');
}

.group-icon {
  background-image: url('../assets/group.png');
}

.share-icon {
  background-image: url('../assets/share.png');
}

/* .settings-icon {
  background-image: url('../assets/settings.png');
}

.chat-icon {
  background-image: url('../assets/chat.png');
} */

</style>