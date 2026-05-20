export function calculateMemberPoints(totalSpent: number) {
  return Math.floor(totalSpent / 25);
}

export function calculateTotalMemberPoints(members: Array<{ totalSpent: { toNumber(): number } | number }>) {
  return members.reduce((sum, member) => {
    const totalSpent = typeof member.totalSpent === "number" ? member.totalSpent : member.totalSpent.toNumber();
    return sum + calculateMemberPoints(totalSpent);
  }, 0);
}
