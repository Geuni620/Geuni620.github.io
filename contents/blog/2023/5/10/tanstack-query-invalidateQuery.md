---
date: '2023-05-10'
title: 'Tanstack Query의 invalidateQueries 이해하기'
categories: ['개발']
summary: '-'
---

### queryKeys

invalidateQueries를 기준으로 무효화가 진행 됨.

```TSX


// useUserBlockedMutation.tsx
export const useUserBlockedMutation = (): UseMutateFunction<
  void,
  unknown,
  selectedUserIdProps,
  unknown
> => {
  const queryClient = useQueryClient();
  const { mutate } = useMutation(
    ({ selectedUserId }: selectedUserIdProps) => blockUser({ selectedUserId }),
    {
      onSuccess: () => {
        return queryClient.invalidateQueries([
          userManagerKeys.userManager,
        ]);
      },
    },
  );

  return mutate;
};


// useUserListQuery.ts
export const useUserListQuery = () => {
  const { data: userList } = useQuery<UserListProps[]>(
    [userManagerKeys.userManager, 'userList'],
    getUserList,
  );

  return { userList };
};
```

- 이 상태에선 userManagerKeys.userManager를 첫 번째로 가지고 있는 모든 useQuery가 무효화된다.
- 즉, 순서의 영향을 받는다.

```TSX
// useUserBlockedMutation.tsx
    {
      onSuccess: () => {
        return queryClient.invalidateQueries([
          'userList',
          userManagerKeys.userManager
        ]);
      },
    },


// useUserListQuery.ts
  const { data: userList } = useQuery<UserListProps[]>(
    ['userList'],
    getUserList,
  );

```

- 만약 이렇게 변경했다면 "userList"는 무효화되지 않는다. 왜냐하면, invalidateQueries를 기준으로 무효화를 하는데, invalidateQueries내 userManagerKeys.userManager이 포함되어 있기 때문이다.

<br>

```TSX
    {
      onSuccess: () => {
        return queryClient.invalidateQueries([
          'userList',
          userManagerKeys.userManager,
        ]);
      },
    },

  const { data: userList } = useQuery<UserListProps[]>(
    [userManagerKeys.userManager],
    getUserList,
  );
```

- 이렇게 작성해도 무효화되지 않는다, 항상 invalidateQueries가 기준이다.

<br>

```TSX
    {
      onSuccess: () => {
        return queryClient.invalidateQueries([
          'userList',
        ]);
      },
    },

  const { data: userList } = useQuery<UserListProps[]>(
    ['userList', userManagerKeys.userManager],
    getUserList,
  );
```

- 위의 것은 무효화가 된다. 왜냐하면 invalidateQueries에 'userList'가 포함되어있고, 순서도 useQuery의 순서와 일치하기 때문이다.
- 즉, queryKey는 invalidateQueries 기준이다.
