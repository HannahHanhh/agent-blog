---
layout: default
title: 所有文章
permalink: /posts/
---

# 所有文章

<ul class="post-list">
  {% for post in site.posts %}
  <li class="post-item">
    <span class="post-date">{{ post.date | date: "%Y-%m-%d" }}</span>
    <a class="post-link" href="{{ post.url | relative_url }}">{{ post.title }}</a>
    {% if post.tags %}
    <span class="post-tags">
      {% for tag in post.tags %}
      <span class="tag">{{ tag }}</span>
      {% endfor %}
    </span>
    {% endif %}
  </li>
  {% endfor %}
</ul>
