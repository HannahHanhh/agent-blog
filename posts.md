---
layout: default
title: 所有文章
permalink: /posts/
---
<main class="main-content">
  <h1 class="page-title">📚 所有文章</h1>
  <div class="post-list-grid">
    {% for post in site.posts %}
    <a class="post-list-item" href="{{ post.url | relative_url }}">
      <span class="date">{{ post.date | date: "%Y-%m-%d" }}</span>
      <span class="title">{{ post.title }}</span>
      {% if post.tags %}
        {% for tag in post.tags %}
        <span class="tag">{{ tag }}</span>
        {% endfor %}
      {% endif %}
    </a>
    {% endfor %}
  </div>
</main>
