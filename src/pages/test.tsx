const categoryList = edges.reduce(
  (
    list: CategoryListProps['categoryList'],
    {
      node: {
        frontmatter: { categories },
      },
    }: PostType,
  ) => {
    categories.forEach(category => {
      if (list[category] === undefined) list[category] = 1
      else list[category]++
    })

    list['All']++

    return list
  },
  { All: 0 },
)
