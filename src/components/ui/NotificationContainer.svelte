<script>
  import { notifications } from '../../services/notificationService.js';
</script>

{#if $notifications.length > 0}
  <div class="notifications">
    {#each $notifications as notification (notification.id)}
      <div class="notification notification--{notification.type}">
        {notification.message}
      </div>
    {/each}
  </div>
{/if}

<style>
  .notifications {
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 3000;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  
  .notification {
    padding: 12px 16px;
    border-radius: 6px;
    font-size: 13px;
    font-weight: 500;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    animation: notificationSlide 0.3s ease-out;
    max-width: 300px;
  }
  
  .notification--success {
    background: #28a745;
    color: white;
  }
  
  .notification--warning {
    background: #ffc107;
    color: #333;
  }
  
  .notification--info {
    background: #5c7cfa;
    color: white;
  }
  
  .notification--error {
    background: #dc3545;
    color: white;
  }
  
  @keyframes notificationSlide {
    from {
      opacity: 0;
      transform: translateX(100%);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }
</style>